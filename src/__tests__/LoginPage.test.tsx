import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/views/LoginPage'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

const mockLogin = vi.fn()

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ login: mockLogin })
  })

  it('renders login form with email and password fields', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText('admin@axiserp.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields on submit', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByText(/email válido/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument()
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByPlaceholderText('admin@axiserp.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('calls login on successful submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByPlaceholderText('admin@axiserp.com'), 'admin@axiserp.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@axiserp.com', 'secret123')
    })
  })

  it('displays backend error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Usuario bloqueado.' } },
    })
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByPlaceholderText('admin@axiserp.com'), 'admin@axiserp.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByText(/usuario bloqueado/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    renderLoginPage()
    await user.type(screen.getByPlaceholderText('admin@axiserp.com'), 'admin@axiserp.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled()
    })
  })
})
