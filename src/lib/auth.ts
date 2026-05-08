import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload } from '@/lib/jwt'

export function getAuthUser(request: NextRequest): JwtPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(request: NextRequest): { user: JwtPayload } | NextResponse {
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return { user }
}
