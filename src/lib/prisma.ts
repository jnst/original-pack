import { PrismaClient } from "@prisma/client"
import path from "path"

declare global {
  var cachedPrisma: PrismaClient
}

// 動的パス解決でSQLiteファイルを指定
const filePath = path.join(process.cwd(), 'prisma/dev.db')
const config = {
  datasources: {
    db: {
      url: 'file:' + filePath,
    },
  },
  log: ["query" as const],
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(config)
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(config)
  }
  prisma = global.cachedPrisma
}

export { prisma }
