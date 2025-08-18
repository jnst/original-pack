import { createClient } from "@libsql/client"

export const db = createClient({
  url: "file:prisma/dev.db",
})

export type DbClient = typeof db
