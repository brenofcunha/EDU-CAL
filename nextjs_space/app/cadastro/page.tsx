import { SignUpForm } from './_components/signup-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export const metadata = { title: 'Criar Conta' }

export default function CadastroPage() {
  return (
    <AuthLayout title="Crie sua conta" description="Começe a estudar Cálculo agora mesmo">
      <SignUpForm />
    </AuthLayout>
  )
}
