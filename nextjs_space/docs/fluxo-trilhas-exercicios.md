# Fluxo de Trilhas ate Exercicios

Este documento descreve o fluxo atual da plataforma EduCalc desde a listagem de trilhas ate a resposta de exercicios. Use-o como referencia antes de alterar navegacao, consultas, validacao de respostas, progresso ou recompensas.

## Visao geral

```mermaid
flowchart TD
    A[GET /trilhas] --> B[TrilhasPage]
    B --> C[getTracks]
    B --> D[TracksGrid]
    D --> E[GET /trilhas/{track}]
    E --> F[TrackPage]
    F --> G[TrackTopics]
    G --> H[Consulta topics por track]
    G --> I[Consulta lessons]
    G --> J[Busca local por titulo ou descricao]
    G --> K[Link da aula]
    K --> L[GET /trilhas/{track}/{topicId}/{lessonId}]
    L --> M[LessonPage]
    M --> N[LessonView]
    N --> O[Consulta lesson]
    N --> P[Consulta exercises por topic_id]
    N --> Q[Consulta lessons irmas]
    P --> R[ExerciseCard]
    R --> S[Usuario seleciona resposta]
    S --> T[Validacao no cliente]
    T --> U[INSERT user_exercise_attempts]
    U --> V{Resposta correta?}
    V -- Nao --> W[Exibe incorreta]
    V -- Sim --> X[Consulta tentativa correta anterior]
    X --> Y[Atualiza profiles: XP e streak]
    Y --> Z[Exibe sucesso e XP ganho]
```

## 1. Listagem de trilhas

**Rota:** `/trilhas`

**Arquivos principais:**

- `app/trilhas/page.tsx`
- `app/trilhas/_components/tracks-grid.tsx`
- `lib/tracks.ts`
- `lib/types.ts`

### Comportamento

1. `TrilhasPage` chama `getTracks()` no servidor.
2. As trilhas sao renderizadas por `TracksGrid`.
3. `TracksGrid` consulta `topics` apenas para contar os topicos de cada trilha.
4. Cada card gera um link para `/trilhas/{track.slug}`.
5. O slug e a chave de navegacao usada para buscar os topicos.

A lista de trilhas vem da tabela `tracks`. A constante `TRACKS` em `lib/types.ts` contem dados de fallback e metadados estaticos usados em outras telas.

## 2. Conteudo de uma trilha

**Rota:** `/trilhas/[track]`

**Arquivos principais:**

- `app/trilhas/[track]/page.tsx`
- `app/trilhas/[track]/_components/track-topics.tsx`

`TrackPage` recebe o slug da trilha pela rota e renderiza `TrackTopics`.

### Consultas do `TrackTopics`

O componente e client-side e usa `useSupabase()`:

```ts
supabase
  .from('topics')
  .select('*')
  .eq('track', track)
  .order('order_index')
```

Depois busca as aulas:

```ts
supabase
  .from('lessons')
  .select('*')
  .order('order_index')
```

As aulas sao associadas aos topicos no cliente por `lesson.topic_id === topic.id`.

### Busca de aulas

A busca e local, sem nova consulta ao banco:

- Busca em `topic.title` e `topic.description`.
- Busca em `lesson.title`.
- Ignora maiusculas/minusculas e acentos usando normalizacao Unicode.
- Quando o topico corresponde, todas as aulas daquele topico permanecem visiveis.
- Quando apenas uma aula corresponde, somente essa aula e exibida dentro do topico.
- O resultado vazio usa o estado `Nenhuma aula encontrada`.

Cada aula e um link para:

```text
/trilhas/{track}/{topic.id}/{lesson.id}
```

## 3. Carregamento da aula

**Rota:** `/trilhas/[track]/[topicId]/[lessonId]`

**Arquivos principais:**

- `app/trilhas/[track]/[topicId]/[lessonId]/page.tsx`
- `app/trilhas/[track]/[topicId]/[lessonId]/_components/lesson-view.tsx`
- `components/exercise-card.tsx`

`LessonPage` apenas extrai os parametros e passa-os para `LessonView`.

### Consultas do `LessonView`

Ao carregar a pagina, `LessonView` busca:

1. A aula atual em `lessons` pelo `lessonId`.
2. Os exercicios do topico em `exercises`, ordenados por `created_at`.
3. As aulas irmas do mesmo topico, usadas para os botoes de proxima/anterior.
4. Para usuario autenticado:
   - progresso em `user_lesson_progress`;
   - favorito em `study_favorites`.

Importante: os exercicios sao filtrados por `topic_id`, nao por `lesson_id`. Atualmente, todos os exercicios do topico aparecem em cada aula daquele topico.

## 4. Renderizacao e validacao do exercicio

**Arquivo:** `components/exercise-card.tsx`

Tipos suportados:

- `mc`: multipla escolha; usa `exercise.options`.
- `tf`: verdadeiro ou falso; oferece `Verdadeiro` e `Falso`.
- `open`: resposta aberta; usa um campo de texto.

Ao clicar em `Verificar Resposta`:

1. O componente impede envio vazio.
2. A resposta selecionada e normalizada:
   - remove espacos nas extremidades;
   - converte para minusculas;
   - remove acentos.
3. A resposta e comparada com `exercise.correct_answer`.
4. Para multipla escolha, tambem e aceita a letra da alternativa (`a`, `b`, `c`...) quando o cadastro usa a letra como resposta correta.
5. O estado visual muda para `Correto!` ou `Incorreto`.
6. O callback `onAnswer` chama `LessonView.handleAnswer`.

A validacao acontece no cliente. O banco recebe o resultado calculado em `is_correct`; portanto, alteracoes nessa regra devem ser refletidas no componente e testadas para os tres tipos de exercicio.

## 5. Persistencia da tentativa e recompensa

**Arquivo:** `lesson-view.tsx`, funcao `handleAnswer`.

A tentativa e salva em `user_exercise_attempts`:

```ts
{
  user_id,
  exercise_id,
  answer,
  is_correct
}
```

Se a resposta estiver correta, o fluxo consulta se ja existe uma tentativa correta para o mesmo usuario e exercicio. O XP so e concedido na primeira tentativa correta.

Depois consulta o perfil atual e atualiza `profiles`:

- `xp_points`: soma `exercise.xp_reward`;
- `streak_days`:
  - mesmo dia: mantem o valor;
  - dia seguinte: incrementa 1;
  - apos um ou mais dias sem atividade: reinicia em 1;
- `last_study_date`: recebe a data atual;
- `updated_at`: recebe o timestamp atual.

Se a tentativa falhar, o usuario recebe uma mensagem de erro e o perfil nao e alterado.

## 6. Tabelas e relacionamentos

```text
tracks.slug
  |
  +--> topics.track
          |
          +--> lessons.topic_id
          |
          +--> exercises.topic_id

profiles.id <--> user_exercise_attempts.user_id
exercises.id <--> user_exercise_attempts.exercise_id
```

Tabelas envolvidas:

- `tracks`: trilhas de conhecimento.
- `topics`: topicos dentro de uma trilha.
- `lessons`: aulas dentro de um topico.
- `exercises`: exercicios associados a um topico.
- `user_exercise_attempts`: historico de respostas.
- `profiles`: XP, streak e data da ultima atividade.
- `user_lesson_progress`: conclusao de aulas.
- `study_favorites`: favoritos de aulas/exercicios.

## 7. Regras de autenticacao e RLS

- Trilhas, topicos, aulas e exercicios sao consultados pelo cliente via Supabase.
- Para responder e acumular XP, o usuario precisa estar autenticado.
- A politica de `user_exercise_attempts` permite inserir e consultar apenas tentativas do proprio usuario.
- A politica de `profiles` permite que o usuario atualize o proprio perfil.
- A camada de middleware protege as rotas autenticadas, mas a pagina da aula tambem trata o caso sem usuario exibindo a aula sem permitir progresso/recompensa.

## 8. Pontos de atencao para futuros agentes

1. **Escopo dos exercicios:** atualmente os exercicios sao carregados por `topic_id`. Se cada exercicio precisar pertencer a uma aula especifica, sera necessario adicionar/usar `lesson_id` na consulta e no modelo.
2. **Recompensa de aula:** `markComplete` grava `user_lesson_progress` e mostra uma mensagem com XP, mas o trecho atual nao atualiza `profiles.xp_points` nem `streak_days`. Nao assumir que marcar uma aula concluida concede XP persistido.
3. **Duplicidade de recompensa:** a protecao contra XP repetido consulta tentativas corretas anteriores. Mudancas concorrentes ou falhas entre a tentativa e a atualizacao do perfil podem exigir uma operacao transacional/RPC no Supabase.
4. **Resposta correta:** manter compatibilidade com respostas cadastradas como texto e como letra de alternativa.
5. **Dados vazios:** a ausencia de configuracao do Supabase deve continuar sendo tratada sem crash; os componentes exibem estados vazios ou carregamento.
6. **Ordenacao:** topicos e aulas dependem de `order_index`; exercicios atualmente usam `created_at`.

## Arquivos de referencia rapida

- Listagem: `app/trilhas/page.tsx`
- Cards de trilha: `app/trilhas/_components/tracks-grid.tsx`
- Topicos, aulas e busca: `app/trilhas/[track]/_components/track-topics.tsx`
- Rota da aula: `app/trilhas/[track]/[topicId]/[lessonId]/page.tsx`
- Fluxo da aula e recompensa: `app/trilhas/[track]/[topicId]/[lessonId]/_components/lesson-view.tsx`
- Validacao visual da resposta: `components/exercise-card.tsx`
- Tipos: `lib/types.ts`
- Schema e politicas: `supabase/schema.sql`
