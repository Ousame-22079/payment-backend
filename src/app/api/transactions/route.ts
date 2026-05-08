import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTxSchema = z.object({
  receiverId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().optional(),
})

// GET /api/transactions — Get user's transactions
export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where =
    auth.user.role === 'ADMIN'
      ? status ? { status: status as any } : {}
      : {
          OR: [{ senderId: auth.user.userId }, { receiverId: auth.user.userId }],
          ...(status ? { status: status as any } : {}),
        }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({ transactions, total, page, pages: Math.ceil(total / limit) })
}

// POST /api/transactions — Create a payment
export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const data = createTxSchema.parse(body)

    if (data.receiverId === auth.user.userId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous payer vous-même' }, { status: 400 })
    }

    const sender = await prisma.user.findUnique({ where: { id: auth.user.userId } })
    if (!sender) return NextResponse.json({ error: 'Expéditeur introuvable' }, { status: 404 })

    if (Number(sender.balance) < data.amount) {
      return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })
    }

    const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } })
    if (!receiver) return NextResponse.json({ error: 'Destinataire introuvable' }, { status: 404 })

    // Simulate payment processing in a transaction
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: auth.user.userId },
        data: { balance: { decrement: data.amount } },
      })
      await tx.user.update({
        where: { id: data.receiverId },
        data: { balance: { increment: data.amount } },
      })
      return tx.transaction.create({
        data: {
          senderId: auth.user.userId,
          receiverId: data.receiverId,
          amount: data.amount,
          description: data.description,
          status: 'COMPLETED',
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        },
      })
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
