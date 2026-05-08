import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard
export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const userId = auth.user.userId
  const isAdmin = auth.user.role === 'ADMIN'

  if (isAdmin) {
    const [totalUsers, totalTx, completed, failed, pending, volume] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.count({ where: { status: 'FAILED' } }),
      prisma.transaction.count({ where: { status: 'PENDING' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalTransactions: totalTx,
      completedTransactions: completed,
      failedTransactions: failed,
      pendingTransactions: pending,
      totalVolume: volume._sum.amount || 0,
    })
  }

  // Regular user dashboard
  const [sent, received, balance] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { senderId: userId, status: 'COMPLETED' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { receiverId: userId, status: 'COMPLETED' },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { balance: true } }),
  ])

  const recentTx = await prisma.transaction.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
    },
  })

  return NextResponse.json({
    balance: balance?.balance || 0,
    totalSent: sent._sum.amount || 0,
    totalReceived: received._sum.amount || 0,
    sentCount: sent._count,
    receivedCount: received._count,
    recentTransactions: recentTx,
  })
}
