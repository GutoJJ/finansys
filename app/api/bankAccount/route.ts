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

    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      }
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contas" },
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
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome da conta é obrigatório" },
        { status: 400 }
      );
    }

    const account = await prisma.financeAccount.create({
      data: {
        userId: session.user.id,
        name,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta" },
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
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID e nome da conta são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica se a conta pertence ao usuário
    const existing = await prisma.financeAccount.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    const account = await prisma.financeAccount.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar conta" },
      { status: 500 }
    );
  }
}
