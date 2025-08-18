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
    console.log('🔍 Vercel production environment detected')
    console.log('📁 Current working directory:', process.cwd())
    console.log('📄 Source DB path:', sourceDbPath)
    console.log('📄 Source DB exists:', fs.existsSync(sourceDbPath))
    
    if (fs.existsSync(sourceDbPath)) {
      const stats = fs.statSync(sourceDbPath)
      console.log('📊 Source DB size:', stats.size, 'bytes')
      console.log('📅 Source DB modified:', stats.mtime)
    }
    
    // Vercel本番環境では /tmp ディレクトリを使用
    const tmpDbPath = '/tmp/dev.db'
    console.log('🎯 Target DB path:', tmpDbPath)
    console.log('🎯 Target DB exists before copy:', fs.existsSync(tmpDbPath))
    
    // DBファイルが /tmp に存在しない場合はコピー
    if (!fs.existsSync(tmpDbPath)) {
      try {
        console.log('📋 Starting database file copy...')
        fs.copyFileSync(sourceDbPath, tmpDbPath)
        console.log('✅ Database copied to /tmp for Vercel deployment')
        
        if (fs.existsSync(tmpDbPath)) {
          const tmpStats = fs.statSync(tmpDbPath)
          console.log('📊 Copied DB size:', tmpStats.size, 'bytes')
        }
      } catch (error) {
        console.error('❌ Failed to copy database to /tmp:', error)
        throw new Error('Database initialization failed')
      }
    } else {
      console.log('♻️  Using existing database in /tmp')
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
