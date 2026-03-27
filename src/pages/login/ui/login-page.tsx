import { useState } from 'react'

import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/shared/api'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { setSession } = useAuthStore()
  const router = useRouter()

  const trimmedEmail = email.trim()
  const trimmedPassword = password.trim()
  const isFormValid = !!trimmedEmail && !!trimmedPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setIsLoading(true)
    setErrorMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    })
    if (error) {
      setIsLoading(false)
      setErrorMsg(error.message)
    } else if (data.session) {
      setSession(data.session)
      router.navigate({ to: '/' })
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px] rounded-2xl border border-border bg-card p-8 shadow-(--shadow)">
        <div className="mb-8 text-center">
          <div className="text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-primary">
            8ake
          </div>
          <div className="mt-1.5 text-[0.7rem] font-medium tracking-[0.12em] text-muted-foreground">
            BAKING NOTEBOOK
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">이메일</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">비밀번호</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
            />
          </div>

          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

          <Button type="submit" disabled={isLoading || !isFormValid} className="w-full">
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            로그인
          </Button>
        </form>
      </div>
    </div>
  )
}
