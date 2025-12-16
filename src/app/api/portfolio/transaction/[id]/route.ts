import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactionId = Number(params.id);
    const body = await req.json();

    const { type, amount, pricePerUnit, date } = body;

    // 1️⃣ Get existing transaction + portfolio
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { portfolio: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // 🔒 Ownership check
    if (existing.portfolio.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const portfolio = existing.portfolio;

    // 2️⃣ Revert old transaction effect
    let revertedAmount =
      existing.type === "buy"
        ? portfolio.amount - existing.amount
        : portfolio.amount + existing.amount;

    // 3️⃣ Apply new transaction effect
    let newPortfolioAmount =
      type === "buy" ? revertedAmount + amount : revertedAmount - amount;

    if (newPortfolioAmount < 0) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // 4️⃣ Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type,
        amount,
        pricePerUnit,
        createdAt: new Date(date),
      },
    });

    // 5️⃣ Update portfolio
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { amount: newPortfolioAmount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
