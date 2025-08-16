# SECURITY POLICY

## Threat Model (High Level)
- Assets: AI chat API key (Gemini), service availability, brand trust, user perception of privacy.
- Adversaries: abusive automated clients (bots), scraping attempts, injection via user input.
- Non-goals: persistent user account protection (no auth), data exfiltration of stored chats (none stored).

## Current Controls
- No chat persistence (minimizes breach impact).
- Strict security headers (CSP, HSTS, X-Frame-Options, etc.).
- In-memory sliding window rate limiting with progressive delay.
- Minimal error surface: standardized JSON error codes.
- Sentry with PII/body stripping.
- Input validation: message count, length, URL filtering.
- Gemini call timeout + bounded retries (2) with backoff.
- User-Agent basic deny list (curl, wget, python-requests heuristics).
- PWA caching excludes /api/chat (NetworkOnly).
- Mobile WebView hardened (incognito, cache disabled, mixed content blocked).

## Additional Recommended (Optional)
- CSP nonce/hash for script-src (build-time injection) if introducing inline scripts.
- Distributed rate limit store (Redis) for multi-instance scale.
- More granular bot fingerprinting (JA3 / behavioral) – likely out of scope.
- SSL pinning on mobile (native module) if high MITM risk.

## Reporting
Security issues: open a private channel or email security@soksol.invalid (placeholder) with details.

## Handling Guidance
1. Reproduce issue safely in staging.
2. Assess impact (auth bypass, rate limit bypass, key leak, etc.).
3. Patch with minimal diff; add regression test.
4. Rotate secrets if any possibility of exposure.

## Dependency Management
- Use `npm audit` in CI (add step if CI pipeline added later).
- Keep `@google/generative-ai`, Next.js, and React updated for security patches.

