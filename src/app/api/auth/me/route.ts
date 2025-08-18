import { NextResponse } from "next/server"
import { getCurrentMember } from "../../../../lib/auth"

export async function GET() {
  try {
    const member = await getCurrentMember()

    if (!member) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        name: member.name,
        rank: member.rank,
        balance: member.balance,
      },
    })
  } catch (error) {
    console.error("Get current member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
