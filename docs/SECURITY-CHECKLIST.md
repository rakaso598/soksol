Security checklist for soksol

Purpose: Make security checks repeatable and auditable.

1) Secrets scanning
- CI: gitleaks (configured via .github/workflows/ci-security.yml) — fails on findings.
- Local: pre-commit script at scripts/pre-commit-secrets.sh blocks commits with obvious secrets.
- Action: If gitleaks finds secrets in history, rotate keys immediately and remove history with BFG or git filter-repo.

2) Dependency management
- CI runs `npm audit` with moderate threshold; add Dependabot or Snyk for automated PRs.

3) Build artifacts and gitignore
- Root .gitignore merges mobile ignore rules. Ensure local dev environments honour it.

4) Mobile key management
- Never commit keystore or passwords. Use GitHub Secrets and store keystore in secure secret manager (AWS Secrets Manager / GCP Secret Manager / HashiCorp Vault).
- During CI release builds, decrypt keystore from secret manager into build agent environment.

## Secret management & CI usage (Required)

1. Store all production secrets in GitHub Secrets (or an external secret manager). Do NOT store keys, passwords, or keystores in the repository.

2. Android keystore handling example (recommended):
   - Locally: base64-encode the keystore file and copy the string into a repository secret `ANDROID_KEYSTORE_BASE64`.
     - Example: `base64 -w0 release.keystore > release.keystore.base64`
   - In CI: decode and write the keystore to a file, then use it for signing during the build.
     - Example (in GitHub Actions):
       - `echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > release.keystore`
       - Use `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` from secrets during signing.

3. Required secrets (example set):
   - `GEMINI_API_KEY` — model API key used by server runtime
   - `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` — mobile release signing
   - `GHCR_TOKEN` (optional) — push Docker images to GHCR

4. CI enforcement and branch protection
   - Configure branch protection on `main`/`dev` to require the following status checks before allowing merge:
     - `CI - Security & Tests` (gitleaks + npm audit + tests)
     - `CI - Docker Build & Scan` (Trivy)
     - `CI - Secrets Presence` (optional job that verifies required secrets exist)
   - This prevents accidental merges when CI detects issues and ensures secrets checks run in CI (local hooks can be bypassed).

5. Rotation & remediation steps
   - If any secret is found in history: immediately rotate the secret in the provider, then use `git filter-repo` or BFG to remove it from history, and push force to all remotes.
   - After rotation, invalidate old keys and update all running environments and CI secrets.

6. Local developer setup
   - Run `npm ci` and then `npm run prepare` to install husky hooks.
   - Document where to place local env files and which secrets are required for local development versus production.

7. Audit cadence
   - Run a full git-history scan quarterly and ensure Dependabot PRs are reviewed within one week.

How to run locally
- npm run scan:secrets (runs gitleaks detect) — requires gitleaks binary via npx or preinstalled.
- git add . && git commit -m "..." will trigger pre-commit hook if husky is set up.

Contact
- security@soksol.invalid (placeholder)
