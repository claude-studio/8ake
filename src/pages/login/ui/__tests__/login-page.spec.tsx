import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.fn()
const mockSetSession = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}))

vi.mock('@/features/auth', () => ({
  useAuthStore: () => ({ setSession: mockSetSession }),
}))

const signInMock = vi.fn()

vi.mock('@/shared/api', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInMock(...args),
    },
  },
  createLoginClient: () => ({
    auth: {
      signInWithPassword: (...args: unknown[]) => signInMock(...args),
    },
  }),
}))

import { LoginPage } from '../login-page'

describe('LoginPage', () => {
  it('이메일/비밀번호 입력 필드와 로그인 버튼 렌더링', () => {
    render(React.createElement(LoginPage))
    expect(screen.getByPlaceholderText('example@email.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('비밀번호')).toBeTruthy()
    expect(screen.getByRole('button', { name: /로그인/ })).toBeTruthy()
  })

  it('초기 로그인 버튼은 비활성화', () => {
    render(React.createElement(LoginPage))
    const button = screen.getByRole('button', { name: /로그인/ })
    expect(button).toBeDisabled()
  })

  it('이메일/비밀번호 입력 시 버튼 활성화', () => {
    render(React.createElement(LoginPage))
    const emailInput = screen.getByPlaceholderText('example@email.com')
    const passwordInput = screen.getByPlaceholderText('비밀번호')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const button = screen.getByRole('button', { name: /로그인/ })
    expect(button).not.toBeDisabled()
  })

  it('폼 제출 시 signInWithPassword 호출', async () => {
    signInMock.mockResolvedValueOnce({
      data: { session: { access_token: 'token' } },
      error: null,
    })

    render(React.createElement(LoginPage))
    const emailInput = screen.getByPlaceholderText('example@email.com')
    const passwordInput = screen.getByPlaceholderText('비밀번호')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('로그인 실패 시 에러 메시지 표시', async () => {
    signInMock.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    render(React.createElement(LoginPage))
    const emailInput = screen.getByPlaceholderText('example@email.com')
    const passwordInput = screen.getByPlaceholderText('비밀번호')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeTruthy()
    })
  })

  it('로그인 성공 시 /home으로 이동', async () => {
    signInMock.mockResolvedValueOnce({
      data: { session: { access_token: 'token' } },
      error: null,
    })

    render(React.createElement(LoginPage))
    const emailInput = screen.getByPlaceholderText('example@email.com')
    const passwordInput = screen.getByPlaceholderText('비밀번호')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
    })
  })
})
