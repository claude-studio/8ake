import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signInMock = vi.fn()
const navigateMock = vi.fn()
const setSessionMock = vi.fn()

vi.mock('@/shared/api', () => ({
  supabase: {
    auth: {
      signInWithPassword: signInMock,
    },
  },
  createLoginClient: () => ({
    auth: {
      signInWithPassword: signInMock,
    },
  }),
}))

vi.mock('@/features/auth', () => ({
  useAuthStore: () => ({ setSession: setSessionMock }),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: navigateMock }),
}))

async function fillAndSubmit(email = 'test@example.com', password = 'password123') {
  await userEvent.type(screen.getByPlaceholderText('example@email.com'), email)
  await userEvent.type(screen.getByPlaceholderText('비밀번호'), password)
  await userEvent.click(screen.getByRole('button', { name: '로그인' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    signInMock.mockReset()
    navigateMock.mockReset()
    setSessionMock.mockReset()
  })

  it('초기에 로그인 버튼이 비활성화되어 있다', async () => {
    const { LoginPage } = await import('../login-page')
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
  })

  it('이메일과 비밀번호를 입력하면 로그인 버튼이 활성화된다', async () => {
    const { LoginPage } = await import('../login-page')
    render(<LoginPage />)
    await userEvent.type(screen.getByPlaceholderText('example@email.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('비밀번호'), 'password123')
    expect(screen.getByRole('button', { name: '로그인' })).not.toBeDisabled()
  })

  it('로그인 성공 시 세션을 설정하고 /home으로 이동한다', async () => {
    const mockSession = { user: { id: 'user-1' }, access_token: 'token' }
    signInMock.mockResolvedValue({ data: { session: mockSession }, error: null })
    const { LoginPage } = await import('../login-page')
    render(<LoginPage />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(setSessionMock).toHaveBeenCalledWith(mockSession)
      expect(navigateMock).toHaveBeenCalledWith({ to: '/home' })
    })
  })

  it('로그인 실패 시 에러 메시지를 표시한다', async () => {
    signInMock.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })
    const { LoginPage } = await import('../login-page')
    render(<LoginPage />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
    expect(navigateMock).not.toHaveBeenCalled()
    expect(setSessionMock).not.toHaveBeenCalled()
  })

  it('로그인 실패 후 버튼이 다시 활성화된다', async () => {
    signInMock.mockResolvedValue({
      data: { session: null },
      error: { message: '오류 발생' },
    })
    const { LoginPage } = await import('../login-page')
    render(<LoginPage />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(screen.getByText('오류 발생')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '로그인' })).not.toBeDisabled()
  })
})
