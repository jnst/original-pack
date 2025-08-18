import { NextResponse } from "next/server"
import { getCurrentMember } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const inventory = await prisma.cardInventory.findMany({
      where: { memberId: member.id },
      include: {
        card: {
          include: {
            oripa: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Get inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
