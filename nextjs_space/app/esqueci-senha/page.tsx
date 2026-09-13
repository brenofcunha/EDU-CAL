import { ForgotPasswordForm } from './_components/forgot-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export const metadata = { title: 'Recuperar Senha' }

export default function EsqueciSenhaPage() {
  return (
    <AuthLayout title="Recuperar senha" description="Enviaremos um link de redefinição para seu e-mail">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
