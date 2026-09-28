import { useState } from 'react'
import type { FormEvent } from 'react'
import type { LoginCredentials } from '../types/auth'

type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  isLoading: boolean
  error: string
}

function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({ email, password })
    setPassword('')
  }

  return (
    <section className="login-card">
      <div className="brand">
        <span className="brand-mark">A</span>
        <div>
          <p className="eyebrow">Papelaria</p>
          <strong>Antonela</strong>
        </div>
      </div>

      <div className="heading">
        <p className="eyebrow">Área administrativa</p>
        <h1>Bem-vinda de volta</h1>
        <p className="description">Entre para gerenciar sua papelaria.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="error-message" role="alert">{error}</p>}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

export default LoginForm
