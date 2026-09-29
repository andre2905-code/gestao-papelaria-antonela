import './App.css'
import AuthenticatedView from './components/AuthenticatedView'
import LoginForm from './components/LoginForm'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, error, isLoading, isInitializing, login, logout } = useAuth();

  if (isInitializing) {
    return (
      <main className="auth-page">
        <p className="description">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="auth-page">
      {user ? (
        <AuthenticatedView user={user} error={error} onLogout={logout} />
      ) : (
        <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
      )}
    </main>
  )
}

export default App
