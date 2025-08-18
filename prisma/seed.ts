import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create test member
  const hashedPassword = await bcrypt.hash("password", 12)
  
  const member = await prisma.member.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: hashedPassword,
      name: "テストユーザー",
      rank: "BRONZE",
      balance: 100000, // 10万円
    },
  })

  console.log("✅ Created test member:", member.email)

  // Create Pachimon Oripa
  const pachimonOripa = await prisma.oripa.create({
    data: {
      title: "Pachimon 25周年記念パック",
      description: "懐かしのPachimonカードが当たる記念パック！レアカード多数収録",
      category: "Pachimon",
      price: 500,
      totalSlots: 100,
      remainingSlots: 100,
      rewardRate: 85.0,
      isActive: true,
    },
  })

  // Create AsobiKing Oripa
  const asobiKingOripa = await prisma.oripa.create({
    data: {
      title: "AsobiKing 蒼眼の白竜パック",
      description: "蒼眼の白竜を中心とした人気カードパック",
      category: "AsobiKing",
      price: 800,
      totalSlots: 50,
      remainingSlots: 50,
      rewardRate: 90.0,
      isActive: true,
    },
  })

  console.log("✅ Created oripas")

  // Create cards for Pachimon Oripa
  const pachimonCards = [
    // S賞 (2枚)
    { name: "パチュウ プロモ", prizeRank: "S", value: 15000, condition: "PSA10" },
    { name: "リザルドン 初版", prizeRank: "S", value: 12000, condition: "PSA9_PLUS" },
    
    // A賞 (5枚)
    { name: "フシギタネ 初版", prizeRank: "A", value: 3000, condition: "MINT" },
    { name: "ゼニカメ 初版", prizeRank: "A", value: 2800, condition: "MINT" },
    { name: "イーヴ プロモ", prizeRank: "A", value: 3200, condition: "PSA9_PLUS" },
    { name: "ミュー ホロ", prizeRank: "A", value: 2500, condition: "MINT" },
    { name: "ミューツ ホロ", prizeRank: "A", value: 2700, condition: "MINT" },
    
    // B賞 (10枚)
    ...Array.from({ length: 10 }, (_, i) => ({
      name: `ホロカード ${i + 1}`,
      prizeRank: "B",
      value: 1200,
      condition: "GOOD",
    })),
    
    // C賞 (20枚)
    ...Array.from({ length: 20 }, (_, i) => ({
      name: `レアカード ${i + 1}`,
      prizeRank: "C",
      value: 600,
      condition: "GOOD",
    })),
    
    // D賞 (30枚)
    ...Array.from({ length: 30 }, (_, i) => ({
      name: `アンコモン ${i + 1}`,
      prizeRank: "D",
      value: 200,
      condition: "PLAY",
    })),
    
    // E賞 (33枚) - 合計100枚になるように
    ...Array.from({ length: 33 }, (_, i) => ({
      name: `コモン ${i + 1}`,
      prizeRank: "E",
      value: 50,
      condition: "PLAY",
    })),
  ]

  for (const cardData of pachimonCards) {
    await prisma.card.create({
      data: {
        oripaId: pachimonOripa.id,
        name: cardData.name,
        prizeRank: cardData.prizeRank,
        condition: cardData.condition,
        value: cardData.value,
        status: "AVAILABLE",
      },
    })
  }

  // Create cards for AsobiKing Oripa
  const asobiKingCards = [
    // S賞 (1枚)
    { name: "蒼眼の白竜 初期", prizeRank: "S", value: 25000, condition: "PSA10" },
    
    // A賞 (3枚)
    { name: "ブラック・ウィザード 初期", prizeRank: "A", value: 8000, condition: "PSA9_PLUS" },
    { name: "エルフの戦士 初期", prizeRank: "A", value: 6000, condition: "MINT" },
    { name: "魂の復活 初期", prizeRank: "A", value: 7000, condition: "MINT" },
    
    // B賞 (6枚)
    ...Array.from({ length: 6 }, (_, i) => ({
      name: `スーパーレア ${i + 1}`,
      prizeRank: "B",
      value: 2000,
      condition: "GOOD",
    })),
    
    // C賞 (15枚)
    ...Array.from({ length: 15 }, (_, i) => ({
      name: `ウルトラレア ${i + 1}`,
      prizeRank: "C",
      value: 800,
      condition: "GOOD",
    })),
    
    // D賞 (25枚) - 合計50枚になるように
    ...Array.from({ length: 25 }, (_, i) => ({
      name: `レア ${i + 1}`,
      prizeRank: "D",
      value: 300,
      condition: "PLAY",
    })),
  ]

  for (const cardData of asobiKingCards) {
    await prisma.card.create({
      data: {
        oripaId: asobiKingOripa.id,
        name: cardData.name,
        prizeRank: cardData.prizeRank,
        condition: cardData.condition,
        value: cardData.value,
        status: "AVAILABLE",
      },
    })
  }

  console.log("✅ Created cards for both oripas")
  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })