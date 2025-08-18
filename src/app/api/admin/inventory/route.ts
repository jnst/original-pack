import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  try {
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

    const inventoryWithStats = inventory.map((oripa) => ({
      ...oripa,
      soldSlots: oripa.totalSlots - oripa.remainingSlots,
      availableCards: oripa._count.cards,
      salesRate: (((oripa.totalSlots - oripa.remainingSlots) / oripa.totalSlots) * 100).toFixed(1),
      status:
        oripa.remainingSlots === 0
          ? "sold_out"
          : oripa.remainingSlots < 10
            ? "low_stock"
            : "in_stock",
    }))

    return NextResponse.json({ inventory: inventoryWithStats })
  } catch (error) {
    console.error("Admin inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
