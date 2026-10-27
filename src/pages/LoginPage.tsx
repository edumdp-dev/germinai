import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react"
import { Navigate } from "react-router-dom"
import { Button } from "@germinai/design-system"
import { useAuth } from "@/components/AuthProvider"
import { api, errorMessage, type User } from "@/lib/api"
import { accountPath, type Locale } from "@/lib/i18n"

type Challenge = { challengeId: string; expiresAt: string; resendAt: string }

export default function LoginPage({ locale }: { locale: Locale }) {
  const en = locale === "en"
  const auth = useAuth()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!challenge) return
    codeRef.current?.focus()
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [challenge])

  if (auth.user) return <Navigate to={accountPath(locale)} replace />
  const resendIn = challenge ? Math.max(0, Math.ceil((Date.parse(challenge.resendAt) - now) / 1000)) : 0
  const expired = challenge && now >= Date.parse(challenge.expiresAt)

  async function requestCode(event?: FormEvent) {
    event?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const result = await api<Challenge>("/auth/request-code", { method: "POST", body: { email: email.trim().toLowerCase(), name: name.trim() || undefined, locale } })
      setNow(Date.now())
      setCode("")
      setChallenge(result)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally { setBusy(false) }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    if (!challenge) return
    setBusy(true)
    setError(null)
    try {
      const result = await api<{ user: User }>("/auth/verify-code", { method: "POST", body: { challengeId: challenge.challengeId, code } })
      auth.signIn(result.user)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally { setBusy(false) }
  }

  return <section className="account-shell container-shell auth-layout" aria-labelledby="login-title">
    <div className="auth-intro">
      <p className="editorial-eyebrow">{en ? "The GerminAI community" : "Comunidade GerminAI"}</p>
      <h1 id="login-title">{en ? "Your ideas deserve a place." : "Suas ideias têm lugar aqui."}</h1>
      <p>{en ? "Create an account or sign in with a code sent to your email. No password to create or remember." : "Crie sua conta ou entre com um código enviado ao seu e-mail. Sem criar ou lembrar uma senha."}</p>
      <div className="auth-note"><ShieldCheck size={22} strokeWidth={1.4} aria-hidden="true" /><p>{en ? "A verified @institutojef.org.br email lets you submit articles. Admins review them before they appear on the blog." : "Com um e-mail verificado @institutojef.org.br, você pode propor artigos. Os admins revisam antes da publicação no blog."}</p></div>
    </div>
    <div className="auth-card">
      <Mail className="auth-card-icon" strokeWidth={1.3} aria-hidden="true" />
      <h2>{challenge ? (en ? "Check your email" : "Confira seu e-mail") : (en ? "Sign in / create account" : "Entrar / criar conta")}</h2>
      {challenge ? <>
        <p className="form-description">{en ? "We sent a six-digit code to" : "Enviamos um código de seis dígitos para"} <strong>{email}</strong>. {en ? "Use it in this browser within 10 minutes." : "Use-o neste navegador em até 10 minutos."}</p>
        <form onSubmit={verifyCode} className="editor-form">
          <label htmlFor="login-code">{en ? "Email code" : "Código do e-mail"}</label>
          <input ref={codeRef} id="login-code" name="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} required />
          {expired && <p className="form-message" role="status">{en ? "This code expired. Request a new one below." : "O código expirou. Peça um novo abaixo."}</p>}
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          <Button type="submit" className="form-submit" disabled={busy || !!expired}>{busy ? (en ? "Checking…" : "Conferindo…") : (en ? "Sign in" : "Entrar")}<ArrowRight aria-hidden="true" /></Button>
        </form>
        <div className="auth-actions"><Button variant="ghost" onClick={() => void requestCode()} disabled={busy || resendIn > 0}>{resendIn > 0 ? (en ? `Resend in ${resendIn}s` : `Reenviar em ${resendIn}s`) : (en ? "Send a new code" : "Enviar novo código")}</Button><Button variant="ghost" disabled={busy} onClick={() => { setChallenge(null); setError(null); setCode("") }}><ArrowLeft aria-hidden="true" />{en ? "Change email" : "Trocar e-mail"}</Button></div>
      </> : <>
        <p className="form-description">{en ? "One flow for new and existing accounts. You confirm your email to continue." : "O mesmo caminho para quem já tem conta e para quem está chegando. Confirme seu e-mail para continuar."}</p>
        <form className="editor-form" onSubmit={requestCode}>
          <label htmlFor="login-name">{en ? "Your name (for new accounts)" : "Seu nome (para novas contas)"}</label>
          <input id="login-name" name="name" autoComplete="name" maxLength={100} value={name} onChange={event => setName(event.target.value)} />
          <label htmlFor="login-email">{en ? "Email" : "E-mail"}</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          <Button type="submit" className="form-submit" disabled={busy || auth.loading}>{busy ? (en ? "Sending…" : "Enviando…") : (en ? "Receive my code" : "Receber meu código")}<ArrowRight aria-hidden="true" /></Button>
        </form>
        <p className="auth-footnote">{en ? "Never share your code. Signing in confirms access to your email; this is not two-factor authentication." : "Não compartilhe seu código. O acesso confirma seu e-mail; não é autenticação de dois fatores."}</p>
      </>}
    </div>
  </section>
}
