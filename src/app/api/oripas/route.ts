import { NextRequest, NextResponse } from "next/server"
import { getCurrentMember } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const member = await getCurrentMember()
    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const oripas = await prisma.oripa.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ oripas })
  } catch (error) {
    console.error("Get oripas error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
