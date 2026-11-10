export type AuthenticatedUser = {
  id: number
  name: string
  email: string
  role: UserRole
}

export type UserRole = 'user' | 'admin' | 'super_admin'

export type LoginCredentials = {
  email: string
  password: string
}
