import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentMember } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

const chargeSchema = z.object({
  amount: z.number().min(1).max(1000000),
})

export async function POST(request: NextRequest) {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = chargeSchema.parse(body)

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: { balance: { increment: amount } },
      select: { balance: true },
    })

    return NextResponse.json({
      balance: updatedMember.balance,
      charged: amount,
    })
  } catch (error) {
    console.error("Balance charge error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
