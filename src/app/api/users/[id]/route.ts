import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  // Only admin or the user themselves
  if (auth.user.role !== 'ADMIN' && auth.user.userId !== params.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, balance: true, createdAt: true },
  })

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  return NextResponse.json(user)
}

// PUT /api/users/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== 'ADMIN' && auth.user.userId !== params.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await request.json()
  const { name, email } = body

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { name, email },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}

// DELETE /api/users/:id — Admin only
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Utilisateur supprimé' })
}
