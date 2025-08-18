import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  try {
    console.log('Admin inventory API called')
    console.log('Environment:', process.env.NODE_ENV)
    
    const inventory = await prisma.oripa.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        totalSlots: true,
        remainingSlots: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            cards: {
              where: {
                status: "AVAILABLE",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const inventoryWithStats = inventory.map((oripa) => {
      // 各プロパティの型と値を詳細ログ
      console.log('🔍 Processing oripa:', oripa.title)
      console.log('  📊 totalSlots:', oripa.totalSlots, typeof oripa.totalSlots)
      console.log('  📊 remainingSlots:', oripa.remainingSlots, typeof oripa.remainingSlots)
      console.log('  💰 price:', oripa.price, typeof oripa.price)
      console.log('  🃏 cardCount:', oripa._count.cards, typeof oripa._count.cards)
      
      const soldSlots = oripa.totalSlots - oripa.remainingSlots
      console.log('  📈 calculated soldSlots:', soldSlots, typeof soldSlots)
      
      const result = {
        ...oripa,
        soldSlots,
        availableCards: oripa._count.cards,
        salesRate: (((oripa.totalSlots - oripa.remainingSlots) / oripa.totalSlots) * 100).toFixed(1),
        status:
          oripa.remainingSlots === 0
            ? "sold_out"
            : oripa.remainingSlots < 10
              ? "low_stock"
              : "in_stock",
      }
      
      console.log('  ✅ final result types:', {
        price: typeof result.price,
        totalSlots: typeof result.totalSlots,
        soldSlots: typeof result.soldSlots,
        availableCards: typeof result.availableCards
      })
      
      return result
    })

    console.log('📦 Returning inventory with', inventoryWithStats.length, 'items')
    return NextResponse.json({ inventory: inventoryWithStats })
  } catch (error) {
    console.error("Admin inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
