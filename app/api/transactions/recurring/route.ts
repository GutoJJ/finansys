import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/lib/auth";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: session.user.id },
      include: {
        account: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recurringTransactions);
  } catch (error) {
    console.error("Erro ao buscar transações recorrentes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transações recorrentes" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      accountId,
      categoryId,
      type,
      amount,
      description,
      frequency,
      startDate,
      endDate,
      active = true,
    } = body;

    if (
      !accountId ||
      !categoryId ||
      !type ||
      !amount ||
      !frequency ||
      !startDate
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        userId: session.user.id,
        accountId,
        categoryId,
        type,
        amount,
        description,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        active,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return NextResponse.json(recurringTransaction, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar transação recorrente:", error);
    return NextResponse.json(
      { error: "Erro ao criar transação recorrente" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID da transação recorrente é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se a transação recorrente pertence ao usuário
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Transação recorrente não encontrada" },
        { status: 404 }
      );
    }

    const recurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...updateData,
        startDate: updateData.startDate
          ? new Date(updateData.startDate)
          : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return NextResponse.json(recurringTransaction);
  } catch (error) {
    console.error("Erro ao atualizar transação recorrente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar transação recorrente" },
      { status: 500 }
    );
  }
}
