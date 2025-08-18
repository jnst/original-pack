import { NextResponse } from "next/server"
import { getCurrentMember } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gachaResults = await prisma.gachaResult.findMany({
      where: { memberId: member.id },
      include: {
        oripa: {
          select: { title: true },
        },
        cards: {
          include: {
            card: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ gachaResults })
  } catch (error) {
    console.error("Get gacha history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
