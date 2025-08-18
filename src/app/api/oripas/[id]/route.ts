import { NextRequest, NextResponse } from "next/server"
import { getCurrentMember } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const oripa = await prisma.oripa.findUnique({
      where: { id },
      include: {
        cards: {
          where: { status: "AVAILABLE" },
          orderBy: { value: "desc" },
        },
      },
    })

    if (!oripa) {
      return NextResponse.json({ error: "Oripa not found" }, { status: 404 })
    }

    return NextResponse.json({ oripa })
  } catch (error) {
    console.error("Get oripa error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
