import { useState } from 'react'
import type { AuthenticatedUser, LoginCredentials } from '../types/auth'
import * as authService from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    setError('')
    setIsLoading(true)

    try {
      setUser(await authService.login(credentials))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout(): Promise<void> {
    setError('')

    try {
      await authService.logout()
      setUser(null)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível sair. Tente novamente.',
      )
    }
  }

  return {
    user,
    error,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  }
}
