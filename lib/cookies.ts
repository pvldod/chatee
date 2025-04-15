import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export const AUTH_COOKIE_NAME = 'auth_token'

export async function setAuthCookie(token: string, options?: Partial<ResponseCookie>) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 dní
    ...options
  })
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  })
} 