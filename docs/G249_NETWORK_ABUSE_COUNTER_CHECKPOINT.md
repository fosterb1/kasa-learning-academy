# G2.4.9 — Experimental local network-abuse counter

**Status:** code and source regression tests committed, local Windows execution **pending**.

## Implemented

The existing `checkLocalAuthRateLimit` PostgreSQL/HMAC implementation now supports separate thresholds for its explicitly supplied `trustedClientIp` dimension, instead of sharing the smaller per-account thresholds:

| Purpose | Account max / window | Simulated trusted-network max / window |
| --- | --- | --- |
| signup | 5 / 60 min | 25 / 60 min |
| login | 20 / 15 min | 40 / 15 min |
| forgot-password | 5 / 60 min | 20 / 60 min |
| reset-password | 10 / 15 min | 30 / 15 min |
| verify-email | 10 / 15 min | 30 / 15 min |

Each counter is a HMAC digest; no raw email, reset token, or IP is written to the counter table. A supplied network identifier must parse as an IPv4/IPv6 address. Both account and network counters use atomic PostgreSQL upserts. The two upserts are **not a single transaction**; review atomic multi-key admission/rollback semantics before enabling on production traffic.

**Crucial security boundary:** No HTTP endpoint or Payload collection hook supplies a network address at this time. In particular, this change does **not** use `X-Forwarded-For`, `X-Real-IP` or `CF-Connecting-IP` as trusted client identity. Anyone can spoof these without a trusted proxy policy. Actual client/network enforcement is **not active** in Academy traffic yet. This milestone validates the shared counter's **ability** to aggregate attempts from a trusted identity; it is not a defense against distributed or real-world abuse on its own.

## Bounded verification

`scripts/test-g249-network-limiter.ts` requires explicit `G249_ALLOW_LOCAL_NETWORK_TEST=yes`, a dedicated local `kasa_academy_dev` DB as `kasa_dev`, G24 limiter enabled and a distinct local rate-limit secret. It generates 41 different `example.invalid` email identifiers and calls the limiter directly with one **fixed simulated loopback identity**. It expects requests 1–40 allowed and request 41 denied. It does not create or send email, call HTTP, invoke external vendors, or modify existing CMS learner records. It **does write 41 HMAC counter increments to the local security table**, and those expire per existing retention policy; previously recorded loopback counters may cause an early block.

### Windows PowerShell

No Next.js server is required. Do not use production or Neon. Stop unrelated G24 local limiter tests first so no other calls consume the same loopback source bucket. Preserve your existing local database backup.

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g249-local-network-limiter.test.mjs
npm.cmd run test:smoke

$env:G249_ALLOW_LOCAL_NETWORK_TEST = 'yes'
$env:G24_ENABLE_LOCAL_RATE_LIMIT = 'yes'
try {
  node --env-file=.env.local --import tsx scripts/test-g249-network-limiter.ts
} finally {
  Remove-Item Env:G249_ALLOW_LOCAL_NETWORK_TEST -ErrorAction SilentlyContinue
  Remove-Item Env:G24_ENABLE_LOCAL_RATE_LIMIT -ErrorAction SilentlyContinue
}
```

Do not share the secret, token, raw connection URL, or credential values. If test stops before attempt 41, do not clear security tables simply to get a PASS: report the sanitized error and investigate the existing source bucket.

## Remaining production blockers

1. Explicitly document the **actual deployment proxy chain** and derive source IP only from a verified, controlled ingress. Never accept unsanitized forwarding headers as trust anchors.
2. Validate classroom/shared-NAT behavior and choose real per-network quotas from measured traffic.
3. Distinguish overloaded counters (429) from unavailable security storage (503).
4. Review transaction semantics for multiple counter identities and test concurrent clients.
5. Complete G2.4.8 actual-browser fragment-removal verification and the privacy/account-enumeration review.

No merge, deployment, paid service or public registration was authorized.
