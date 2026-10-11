import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { apiRequest } from "../api"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    apiRequest<{ authenticated: boolean }>("/auth/session")
      .then(({ authenticated }) => {
        if (authenticated) window.location.replace("/admin/dashboard")
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!email.trim() || !password) {
      setError("Enter your email address and password.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.")
      return
    }
    setLoading(true)
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      })
      window.location.assign("/admin/dashboard")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-5 py-12">
      <section className="w-full max-w-[440px] rounded-xl border border-line bg-white p-7 shadow-[0_18px_60px_rgba(61,52,45,.08)] sm:p-10">
        <a
          href="/"
          className="font-display text-2xl text-terracotta sm:text-[27px]"
        >
          Woolen Decorations
        </a>
        <div className="mt-10 flex size-11 items-center justify-center rounded-full bg-sand text-terracotta">
          <LockKeyhole size={19} />
        </div>
        <p className="eyebrow mt-6">PRIVATE ADMIN AREA</p>
        <h1 className="mt-2 font-display text-4xl leading-none">Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-brown/65">
          Sign in to manage your handmade collection.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-medium" htmlFor="admin-email">
            Email address
            <input
              id="admin-email"
              autoComplete="username"
              className="mt-2 w-full rounded-md border border-line bg-ivory/50 px-4 py-3 font-normal outline-none focus:border-terracotta"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="admin-password">
            Password
            <span className="relative mt-2 block">
              <input
                id="admin-password"
                autoComplete="current-password"
                className="w-full rounded-md border border-line bg-ivory/50 px-4 py-3 pr-12 font-normal outline-none focus:border-terracotta"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 grid place-items-center text-brown/60"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            className="button-primary w-full justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-brown/70 transition-colors hover:text-terracotta"
        >
          <ArrowLeft size={15} /> Back to home
        </a>
        <p className="mt-6 border-t border-line pt-5 text-xs leading-5 text-brown/55">
          This area is restricted to the site administrator.
        </p>
      </section>
    </main>
  )
}
