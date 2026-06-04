# Security Policy

## Prototype Scope

This is a presale prototype. Security measures are appropriate for a demo environment, not production.

## Measures Applied

1. **`.npmrc` hardening**:
   - `minimum-release-age=7d` — avoids packages published < 7 days ago
   - `ignore-scripts=true` — prevents install-time script execution
   - `save-exact=true` — pins exact versions

2. **Network isolation**:
   - MSSQL port bound to `127.0.0.1:1433` (localhost only)
   - CORS restricted to `http://localhost:5173`

3. **Dependency hygiene**:
   - No axios (supply chain risk)
   - No node-ipc (known malicious history)
   - `pnpm audit --prod` run before release

4. **API security**:
   - `hono/secure-headers` middleware (CSP, X-Content-Type-Options, etc.)
   - In-memory rate limiting

## Known Limitations (Prototype)

- No authentication/authorization layer
- SA password in `.env` (not rotated)
- No TLS between API and database
- No input sanitization beyond Zod validation
- Rate limiting is in-memory (resets on restart)

## Audit Results

_To be populated at release time._
