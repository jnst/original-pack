import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { GachaType } from "../../../../domain/models/gacha"
import type { MemberId } from "../../../../domain/models/member"
import type { OripaId } from "../../../../domain/models/oripa"
import { executeGachaEngine } from "../../../../domain/services/gacha-engine"
import { getCurrentMember } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

const gachaSchema = z.object({
  oripaId: z.string(),
  gachaType: z.enum(["SINGLE", "TEN", "HUNDRED"]),
})

export async function POST(request: NextRequest) {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { oripaId, gachaType } = gachaSchema.parse(body)

    const oripa = await prisma.oripa.findUnique({
      where: { id: oripaId },
      include: {
        cards: {
          where: { status: "AVAILABLE" },
        },
      },
    })

    if (!oripa || !oripa.isActive) {
      return NextResponse.json({ error: "Oripa not found or inactive" }, { status: 404 })
    }

    const domainCards = oripa.cards.map((card) => ({
      id: card.id,
      oripaId: card.oripaId as OripaId,
      name: card.name,
      prizeRank: card.prizeRank as "S" | "A" | "B" | "C" | "D" | "E" | "MISS" | "GUARANTEED",
      condition: card.condition as "PSA10" | "PSA9_PLUS" | "MINT" | "GOOD" | "PLAY",
      value: card.value,
      status: card.status as "AVAILABLE" | "ALLOCATED",
      imageUrl: card.imageUrl,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }))

    const result = executeGachaEngine({
      memberId: member.id as MemberId,
      oripaId: oripaId as OripaId,
      gachaType: gachaType as GachaType,
      availableCards: domainCards,
      memberBalance: member.balance,
      pricePerUnit: oripa.price,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { gachaResult, allocatedCards, totalCost } = result.value

    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: member.id },
        data: { balance: { decrement: totalCost } },
      })

      await tx.card.updateMany({
        where: {
          id: { in: allocatedCards.map((card) => card.id) },
        },
        data: { status: "ALLOCATED" },
      })

      const createdGachaResult = await tx.gachaResult.create({
        data: {
          id: gachaResult.id,
          memberId: gachaResult.memberId,
          oripaId: gachaResult.oripaId,
          gachaType: gachaResult.gachaType,
          totalCost: gachaResult.totalCost,
        },
      })

      await tx.gachaResultCard.createMany({
        data: allocatedCards.map((card) => ({
          gachaResultId: createdGachaResult.id,
          cardId: card.id,
        })),
      })

      for (const card of allocatedCards) {
        await tx.cardInventory.upsert({
          where: {
            memberId_cardId: {
              memberId: member.id,
              cardId: card.id,
            },
          },
          create: {
            memberId: member.id,
            cardId: card.id,
            quantity: 1,
          },
          update: {
            quantity: { increment: 1 },
          },
        })
      }

      await tx.oripa.update({
        where: { id: oripaId },
        data: { remainingSlots: { decrement: allocatedCards.length } },
      })
    })

    return NextResponse.json({
      gachaResult: {
        id: gachaResult.id,
        gachaType: gachaResult.gachaType,
        totalCost: gachaResult.totalCost,
        cards: allocatedCards,
        createdAt: gachaResult.createdAt,
      },
    })
  } catch (error) {
    console.error("Gacha execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
