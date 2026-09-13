# EduCalc — Plataforma de Estudo de Cálculo

Plataforma web completa para estudo de Cálculo I, II, III e Vetorial.

## Setup

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Copie a **Project URL** e a **Anon Key** (em Settings > API).
3. Copie também a **Service Role Key** (necessária para operações admin).

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 3. Executar o Schema SQL

1. Abra o **SQL Editor** no painel do Supabase.
2. Copie e cole todo o conteúdo de `supabase/schema.sql`.
3. Execute o script.

Isso criará:
- Todas as tabelas (profiles, topics, lessons, exercises, etc.)
- Trigger para criação automática de perfis
- Políticas RLS para segurança em nível de linha
- Permissões de admin para gerenciamento de conteúdo

### 4. Configurar autenticação

No painel do Supabase, em **Authentication > Providers**:
- Habilite **Email** (já vem habilitado por padrão).
- (Opcional) Desabilite **Confirm email** para desenvolvimento rápido.

### 5. Conta Admin

A conta com prefixo de e-mail `brenofcunha` recebe automaticamente `role = 'admin'`.
Por exemplo, ao cadastrar `brenofcunha@email.com`, o trigger atribui o role de administrador.

## Estrutura do Projeto

```
app/
  page.tsx                     # Landing page
  login/                       # Login
  cadastro/                    # Cadastro
  esqueci-senha/               # Recuperação de senha
  trilhas/                     # Trilhas públicas
    [track]/                   # Tópicos de uma trilha
      [topicId]/[lessonId]/    # Visualização de aula
  forum/                       # Fórum público
    [id]/                      # Detalhe do post
    novo/                      # Novo post (autenticado)
  (authenticated)/
    dashboard/                 # Dashboard do aluno
    pasta/                     # Pasta de estudo
      notas/nova/              # Nova anotação
      notas/[id]/              # Editar anotação
    perfil/                    # Perfil do usuário
    admin/                     # Painel admin
      usuarios/                # Gerenciar usuários
      conteudo/                # CRUD de conteúdo
      forum/                   # Moderação do fórum
      tags/                    # CRUD de tags
      logs/                    # Logs de auditoria
```

## Tecnologias

- **Framework**: Modern web application
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (email/senha)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Fórmulas**: KaTeX via react-markdown + remark-math + rehype-katex
- **Animações**: Framer Motion

## Funcionalidades

- 📚 4 trilhas de Cálculo com tópicos e aulas em Markdown/KaTeX
- 🎯 Exercícios interativos (múltipla escolha, V/F, aberta)
- 📁 Pasta de estudo com anotações Markdown e favoritos
- 💬 Fórum colaborativo com votos, tags e moderação
- 🏆 Gamificação com XP e streaks
- 🔒 Painel admin para gerenciamento completo
- 🌙 Tema claro/escuro
- 📱 Design responsivo
