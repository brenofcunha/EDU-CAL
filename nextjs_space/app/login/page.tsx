import { LoginForm } from './_components/login-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export const metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <AuthLayout title="Bem-vindo de volta" description="Faça login para continuar seus estudos">
      <LoginForm />
    </AuthLayout>
  )
}
