import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/transactions/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const tx = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      receiver: { select: { id: true, name: true, email: true } },
    },
  })

  if (!tx) return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })

  const canView =
    auth.user.role === 'ADMIN' ||
    tx.senderId === auth.user.userId ||
    tx.receiverId === auth.user.userId

  if (!canView) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  return NextResponse.json(tx)
}

// PATCH /api/transactions/:id — Update status (Admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { status } = await request.json()
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const tx = await prisma.transaction.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(tx)
}
