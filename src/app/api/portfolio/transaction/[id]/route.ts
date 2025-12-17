import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Validate transaction ID param
    if (!id) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Parse request body
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

    // Fetch existing transaction with portfolio
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

    // Ownership check
    if (existing.portfolio.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const portfolio = existing.portfolio;

    //  Revert old transaction effect
    let revertedAmount =
      existing.type === "buy"
        ? Number(portfolio.amount) - existing.amount
        : Number(portfolio.amount) + existing.amount;

    // Apply new transaction effect
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

    // Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type,
        amount: parsedAmount,
        pricePerUnit: parsedPrice,
        createdAt: parsedDate,
      },
    });

    // Update portfolio
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await and validate transaction ID param
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Fetch existing transaction with portfolio
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

    // Ownership check
    if (existing.portfolio.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const portfolio = existing.portfolio;

    // Revert transaction effect from portfolio
    let newPortfolioAmount =
      existing.type === "buy"
        ? Number(portfolio.amount) - existing.amount
        : Number(portfolio.amount) + existing.amount;

    if (newPortfolioAmount < 0) {
      return NextResponse.json(
        { error: "Cannot delete: would result in negative balance" },
        { status: 400 }
      );
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    // Update portfolio amount (or delete portfolio if amount becomes 0)
    if (newPortfolioAmount === 0) {
      await prisma.portfolio.delete({
        where: { id: portfolio.id },
      });
    } else {
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: { amount: newPortfolioAmount },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
