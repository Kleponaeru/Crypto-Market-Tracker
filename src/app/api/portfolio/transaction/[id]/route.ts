import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1️⃣ Validate transaction ID param
    if (!params?.id) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    const transactionId = Number(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // 2️⃣ Parse request body
    const body = await req.json();
    const { type, amount, pricePerUnit, date } = body;

    if (type !== "buy" && type !== "sell") {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    const parsedPrice = Number(pricePerUnit);
    const parsedDate = new Date(date);

    if (
      isNaN(parsedAmount) ||
      isNaN(parsedPrice) ||
      isNaN(parsedDate.getTime())
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // 3️⃣ Fetch existing transaction with portfolio
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

    // 4️⃣ Ownership check
    if (existing.portfolio.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const portfolio = existing.portfolio;

    // 5️⃣ Revert old transaction effect
    let revertedAmount =
      existing.type === "buy"
        ? Number(portfolio.amount) - existing.amount
        : Number(portfolio.amount) + existing.amount;

    // 6️⃣ Apply new transaction effect
    let newPortfolioAmount =
      type === "buy"
        ? revertedAmount + parsedAmount
        : revertedAmount - parsedAmount;

    if (newPortfolioAmount < 0) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // 7️⃣ Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type,
        amount: parsedAmount,
        pricePerUnit: parsedPrice,
        createdAt: parsedDate,
      },
    });

    // 8️⃣ Update portfolio
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
