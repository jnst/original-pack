import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { MemberId } from "../domain/models/member"
import { prisma } from "./prisma"

export type AuthError = "Auth.InvalidCredentials" | "Auth.UserNotFound" | "Auth.Unauthorized"

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const createSession = async (memberId: MemberId): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set("session", memberId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export const getSession = async (): Promise<MemberId | null> => {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")
  return (session?.value as MemberId) || null
}

export const clearSession = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export const getCurrentMember = async () => {
  const memberId = await getSession()
  if (!memberId) {
    return null
  }

  return prisma.member.findUnique({
    where: { id: memberId },
  })
}
