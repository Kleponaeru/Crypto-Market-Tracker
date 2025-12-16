import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/* =======================
   GET — fetch transactions
======================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const transactions = await prisma.transaction.findMany({
      where: {
        portfolio: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        amount: true,
        pricePerUnit: true,
        createdAt: true,
        portfolio: {
          select: {
            coinId: true,
            coinName: true,
            symbol: true,
          },
        },
      },
    });

    // Shape data for frontend
    const result = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      pricePerCoin: tx.pricePerUnit,
      createdAt: tx.createdAt,
      coinId: tx.portfolio.coinId,
      coinName: tx.portfolio.coinName,
      coinSymbol: tx.portfolio.symbol,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =======================
   POST — create transaction
======================= */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { coinId, coinName, symbol, type, amount, pricePerUnit, date } = body;

    if (!coinId || !type || !amount || !pricePerUnit) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userId = Number(session.user.id);

    // Find or create portfolio
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
        coinId,
      },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          coinId,
          coinName,
          symbol,
          amount: 0,
        },
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        portfolioId: portfolio.id,
        type,
        amount,
        pricePerUnit,
        createdAt: date ? new Date(date) : new Date(),
      },
    });

    // Update portfolio amount
    const newAmount =
      type === "buy" ? portfolio.amount + amount : portfolio.amount - amount;

    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { amount: newAmount },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
