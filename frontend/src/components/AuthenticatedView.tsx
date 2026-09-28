import type { AuthenticatedUser } from '../types/auth'

type AuthenticatedViewProps = {
  user: AuthenticatedUser
  error: string
  onLogout: () => Promise<void>
}

function AuthenticatedView({ user, error, onLogout }: AuthenticatedViewProps) {
  return (
    <section className="welcome-card">
      <span className="brand-mark">A</span>
      <p className="eyebrow">Papelaria Antonela</p>
      <h1>Olá, {user.name}!</h1>
      <p className="description">Você está autenticado com segurança.</p>
      <p className="user-email">{user.email}</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <button type="button" className="secondary-button" onClick={onLogout}>
        Sair
      </button>
    </section>
  )
}

export default AuthenticatedView
