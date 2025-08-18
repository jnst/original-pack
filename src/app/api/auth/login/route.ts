import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { MemberId } from "../../../../domain/models/member"
import { createSession, verifyPassword } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const member = await prisma.member.findUnique({
      where: { email },
    })

    if (!member) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, member.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession(member.id as MemberId)

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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
