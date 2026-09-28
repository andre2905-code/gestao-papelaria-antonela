import type { AuthenticatedUser, LoginCredentials } from '../types/auth'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getCsrfToken(): string {
  const token = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.substring('XSRF-TOKEN='.length)

  return token ? decodeURIComponent(token) : ''
}

async function getErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({}))

  if (payload.errors) {
    return Object.values(payload.errors as Record<string, string[]>)
      .flat()
      .join(' ')
  }

  return payload.message ?? 'Não foi possível concluir a operação. Tente novamente.'
}

async function requestCsrfCookie(): Promise<void> {
  const response = await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Não foi possível iniciar a sessão segura.')
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
  await requestCsrfCookie()

  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const userResponse = await fetch(`${apiUrl}/api/user`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!userResponse.ok) {
    throw new Error('Login realizado, mas não foi possível carregar o usuário.')
  }

  return userResponse.json()
}

export async function logout(): Promise<void> {
  const response = await fetch(`${apiUrl}/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}
