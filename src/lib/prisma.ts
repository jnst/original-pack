import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

declare global {
  var cachedPrisma: PrismaClient
}

// 環境別データベースパス設定
function getDatabasePath(): string {
  const sourceDbPath = path.join(process.cwd(), 'prisma/dev.db')
  
  if (process.env.NODE_ENV === "production") {
    // Vercel本番環境では /tmp ディレクトリを使用
    const tmpDbPath = '/tmp/dev.db'
    
    // DBファイルが /tmp に存在しない場合はコピー
    if (!fs.existsSync(tmpDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, tmpDbPath)
        console.log('Database copied to /tmp for Vercel deployment')
      } catch (error) {
        console.error('Failed to copy database to /tmp:', error)
        throw new Error('Database initialization failed')
      }
    }
    
    return tmpDbPath
  } else {
    // 開発環境では従来のパス
    return sourceDbPath
  }
}

const dbPath = getDatabasePath()
const config = {
  datasources: {
    db: {
      url: 'file:' + dbPath,
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
