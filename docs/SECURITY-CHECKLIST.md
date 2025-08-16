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

5) Rate limiting & Scaling
- In-memory rate limiting is fine for single-instance. For multi-instance, use Redis or central store.

6) Monitoring & incident response
- Sentry is integrated; ensure alert routing to on-call channel.

7) Post-scan actions
- If any secret is found in git history: rotate, remove history, and invalidate exposed credentials.

How to run locally
- npm run scan:secrets (runs gitleaks detect) — requires gitleaks binary via npx or preinstalled.
- git add . && git commit -m "..." will trigger pre-commit hook if husky is set up.

Contact
- security@soksol.invalid (placeholder)
