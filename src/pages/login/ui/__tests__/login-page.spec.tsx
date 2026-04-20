import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const { mockNavigate, mockSetSession, mockSignInWithPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSetSession: vi.fn(),
  mockSignInWithPassword: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}))

vi.mock('@/features/auth', () => ({
  useAuthStore: () => ({ setSession: mockSetSession }),
}))

vi.mock('@/shared/api', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
  createLoginClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

import { LoginPage } from '../login-page'

function renderLoginPage() {
  return render(<LoginPage />)
}

describe('LoginPage', () => {
  it('로그인 폼 렌더링 — 이메일, 비밀번호, 로그인 버튼', () => {
    renderLoginPage()

    expect(screen.getByPlaceholderText('example@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument()
  })

  it('이메일과 비밀번호가 비어있으면 버튼 비활성화', () => {
    renderLoginPage()

    const submitBtn = screen.getByRole('button', { name: /로그인/ })
    expect(submitBtn).toBeDisabled()
  })

  it('이메일만 입력하면 버튼 비활성화 유지', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('example@email.com'), 'test@example.com')

    expect(screen.getByRole('button', { name: /로그인/ })).toBeDisabled()
  })

  it('이메일과 비밀번호 모두 입력하면 버튼 활성화', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('example@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('비밀번호'), 'password123')

    expect(screen.getByRole('button', { name: /로그인/ })).toBeEnabled()
  })

  it('로그인 성공 → setSession 호출 후 /home 으로 이동', async () => {
    const user = userEvent.setup()
    const mockSession = { access_token: 'token', user: { id: 'user-1' } }
    mockSignInWithPassword.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    renderLoginPage()

    await user.type(screen.getByPlaceholderText('example@email.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith(mockSession)
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
    })
  })

  it('로그인 실패 → 에러 메시지 표시', async () => {
    const user = userEvent.setup()
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    renderLoginPage()

    await user.type(screen.getByPlaceholderText('example@email.com'), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText('비밀번호'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /로그인/ }))

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('로그인 상태 유지 체크박스 기본값 true', () => {
    renderLoginPage()

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })
})
