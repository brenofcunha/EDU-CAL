---
name: git-commit-push
description: "Use when committing and pushing project changes to the Git remote. Follow the repository's safe Git workflow: validate changes, protect secrets, stage files selectively, commit with a clear message, and push the correct branch."
---

# Git Commit And Push

Use this workflow whenever changes need to be committed and published to the remote repository.
The push is blocked whenever a required validation fails. A commit is not considered ready merely
because Git accepts it: it must be installable and buildable by Vercel from `nextjs_space`.

## Repository conventions

- Project directory: `nextjs_space`.
- Remote: `https://github.com/brenofcunha/EDU-CAL.git`.
- Development branch: `develop`.
- Production branch: `main`.
- Push directly to `develop` for development work.
- Push to `main` only when the user explicitly requests production publication or merge promotion.

## Pre-commit checks

1. Confirm the repository root, current branch, and remote:

   ```powershell
   git rev-parse --show-toplevel
   git branch --show-current
   git remote -v
   ```

2. Inspect pending changes:

   ```powershell
   git status --short --branch
   git diff --check
   ```

3. Confirm that the Vercel project uses `nextjs_space` as its Root Directory and that the build command is `npm run build`. Never change these settings to `dist`, `out`, `src`, or a generic Node entrypoint for this project.

4. Never stage blindly with `git add .` when unrelated or generated files are present. Stage the intended files explicitly.

5. Never commit these files or directories:

   - `.env`, `.env.local`, `.env.*.local`
   - service-role keys, API tokens, passwords, certificates, `.pem`, `.key`, `.crt`
   - `node_modules/`
   - `.next/`, `dist/`, `out/`, `coverage/`
   - `*.tsbuildinfo`, logs, local metadata, temporary files
   - files outside the project directory

6. `.env.example` may be committed only with placeholders, never real credentials. Check staged text for secrets before committing:

   ```powershell
   git diff --cached -- . ':!package-lock.json' | Select-String -Pattern 'service_role|eyJ[A-Za-z0-9_-]{20,}|-----BEGIN|postgres(ql)?://[^ ]+:[^ ]+@|sk-[A-Za-z0-9]+'
   ```

   Any match must be investigated and removed before continuing. Never print or paste secret values into chat.

7. Review the staged file list before committing:

   ```powershell
   git diff --cached --name-status
   ```

8. Keep dependency manifests consistent. If `package-lock.json` exists, every change to `package.json` must be followed by a successful `npm install`, and both files must be staged. Prefer `npm ci` for the final clean-install check.

9. Run the required deployment gate from `nextjs_space` before committing:

   ```powershell
   if (Test-Path package-lock.json) { npm ci } else { npm install }
   if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed; do not commit or push.' }
   npm run lint
   if ($LASTEXITCODE -ne 0) { throw 'Lint failed; do not commit or push.' }
   npm run build
   if ($LASTEXITCODE -ne 0) { throw 'Production build failed; do not commit or push.' }
   ```

   If Turbopack fails only because the local Windows path contains accented characters, validate with Webpack and record that limitation:

   ```powershell
   npx next build --webpack
   ```

   A dependency error, missing module, TypeScript error, route error, or application build error is a
   hard stop. Do not use `--force`, `--legacy-peer-deps`, or skip scripts to make the check appear green.
   The Webpack fallback is allowed only for the known local Turbopack path panic, not for ordinary build failures.

## Commit format

Use a concise imperative message in Portuguese or English that states the result, for example:

```text
Adiciona gerenciamento de trilhas e edicao de conteudo
Corrige dependencias do deploy na develop
Atualiza configuracao de autenticacao
```

Avoid vague messages such as `update`, `fix`, or `changes`.

## Standard development push

From the project directory:

```powershell
git switch develop
git pull --rebase origin develop
git add <explicit-files> package.json package-lock.json
git diff --cached --name-status
git diff --cached --check
git commit -m "Descricao clara da alteracao"
git push -u origin develop
```

Run the validation gate before `git commit`; if the commit changes dependencies, rerun it after
staging `package.json` and `package-lock.json`. Never push a commit that was not built from the
same project directory configured in Vercel.

If the branch does not exist locally:

```powershell
git switch -c develop
git push -u origin develop
```

If the remote branch already contains commits and the push is rejected, do not force-push. Run:

```powershell
git pull --rebase origin develop
git push origin develop
```

Resolve conflicts carefully, then rerun validation before pushing.

## Production push

Only after explicit confirmation to publish production changes:

```powershell
git switch main
git pull --rebase origin main
git merge --ff-only develop
npm ci
npm run build
git push origin main
```

Production promotion is blocked if the fast-forward merge, clean install, or production build fails.
Do not bypass the gate with a force push or by changing the Vercel output directory.

Do not use `git push --force`, `git reset --hard`, or `git checkout --` to bypass conflicts or discard work.

## Post-push verification

Confirm the result:

```powershell
git status --short --branch
git log -1 --oneline
```

Also confirm that the pushed commit contains the expected dependency lockfile and no generated files:

```powershell
git diff-tree --no-commit-id --name-only -r HEAD
git ls-files | Select-String '(^|/)(\.env|node_modules|\.next|dist|out|coverage)/|\.pem$|\.key$|\.crt$'
```

The second command must not show sensitive or generated files. If it does, stop and remove the
file in a new corrective commit; never rewrite shared history without explicit authorization.

The expected state is a clean branch tracking its remote, for example:

```text
## develop...origin/develop
```

Report the branch, commit hash, remote, and any intentionally excluded files after the push.
