import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/lib/auth";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// GET - Pega as informações necessárias para o carregamento da dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Busca dados em paralelo para melhor performance
    const [
      accounts,
      categories,
      recentTransactions,
      recurringTransactions,
      goals,
      totalIncome,
      totalExpense,
    ] = await Promise.all([
      // Todas as contas
      prisma.financeAccount.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),

      // Todas as categorias
      prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),

      // Transações recentes (últimas 10)
      prisma.transaction.findMany({
        where: { userId },
        include: {
          account: true,
          category: true,
        },
        orderBy: { date: "desc" },
        take: 10,
      }),

      // Transações recorrentes ativas
      prisma.recurringTransaction.findMany({
        where: { userId, active: true },
        include: {
          account: true,
          category: true,
        },
      }),

      // Metas
      prisma.goal.findMany({
        where: { userId },
        orderBy: { deadline: "asc" },
      }),

      // Total de receitas (último mês)
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Total de despesas (último mês)
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Calcula o saldo atual
    const currentMonthIncome = totalIncome._sum.amount || 0;
    const currentMonthExpense = totalExpense._sum.amount || 0;
    const balance = Number(currentMonthIncome) - Number(currentMonthExpense);

    // Agrupa transações por categoria para o gráfico
    const transactionsByCategory = await prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: {
        userId,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Enriquece com informações de categoria
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));
    const categoryData = transactionsByCategory.map((item) => ({
      category: categoriesMap.get(item.categoryId),
      type: item.type,
      total: item._sum.amount,
    }));

    return NextResponse.json({
      summary: {
        totalIncome: currentMonthIncome,
        totalExpense: currentMonthExpense,
        balance,
        currentMonth: new Date().toLocaleString("pt-BR", { month: "long" }),
      },
      accounts,
      categories,
      recentTransactions,
      recurringTransactions,
      goals,
      categoryData,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados da dashboard" },
      { status: 500 }
    );
  }
}
