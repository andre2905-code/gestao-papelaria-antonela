
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Store } from 'lucide-react'
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
    <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">

      {/* Identidade da papelaria */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-antonela-600 text-white shadow-sm">
          <Store className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Papelaria
          </p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Antonela
          </h2>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-antonela-600 dark:text-antonela-200">
          Área administrativa
        </p>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Bem-vinda de volta!
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Entre com suas credenciais para gerenciar sua papelaria.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            E-mail
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-antonela-500 focus:ring-2 focus:ring-antonela-500/20 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Senha
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-antonela-500 focus:ring-2 focus:ring-antonela-500/20 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </div>

        {error && (
          <p
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-antonela-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-antonela-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

      </form>

      <div className="mt-8 border-t border-slate-100 pt-5 text-center dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Sistema de Gestão — Papelaria Antonela
        </p>
      </div>
    </section>
  )
}

export default LoginForm
