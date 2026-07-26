# Security model

Relay is multi-tenant: every account gets its own workspace, and nothing from one
workspace may reach another. This page records the rules and the audit that
established them, so the next change keeps the guarantees.

## The rule that matters

**Any value that arrives from the browser is untrusted, including ids.** Server
actions are public HTTP endpoints. A signed-in user can invoke any exported action
with any argument, so "the UI only shows them their own releases" is not a control.

Every browser-reachable action therefore starts by proving ownership:

| Guard | Used by |
| --- | --- |
| `assertOwnedRelease(id)` | generate, refine, save asset, update meta, publish, unpublish, delete |
| `assertOwnedRepository(id)` | create release for repo, toggle auto-publish, remove repo |
| `requireWorkspaceManager()` | invite member, remove member (owner/admin only) |
| `isInstanceOperator(user)` | GitHub app setup, reset, manifest callback |

Pages that load a record by id from the URL scope the query the same way, so a
foreign id renders a 404 instead of someone else's data.

## Audit findings (2026-07)

Fixed in the release-module and audit passes:

1. **Cross-workspace release access (critical).** Release actions took an id with no
   ownership check, and the detail page loaded any release by id. A user could read,
   generate, edit, publish, or delete another workspace's release. Verified fixed: a
   fresh account opening a foreign release URL now gets 404.
2. **Cross-workspace member deletion (critical).** `removeMember` deleted any
   membership by id, from any workspace. Now scoped to the caller's workspace.
3. **Privilege escalation via invites (high).** `inviteMember` accepted whatever role
   the form posted (including `owner`) and had no permission check, so any member
   could promote an accomplice. Now restricted to owners/admins, and only `member` or
   `admin` can be granted.
4. **Last-owner removal (medium).** A workspace could be left with no owner. Refused.
5. **Shared GitHub app exposure (medium).** The instance's GitHub App name was shown
   to every user, and any user could click "Re-register app" and wipe the operator's
   registration. Now operator-only, enforced server-side.
6. **Webhook fan-out (correctness/isolation).** The handler used `findFirst`, so when
   several workspaces imported the same repository only one received the release.
7. **Unvalidated input (low).** Workspace slugs are now format-checked, length-capped,
   reserved-word blocked, and uniqueness-checked (previously a collision produced a raw
   database error). Subscriber emails are validated before storage.

## Secrets

- The GitHub App private key, client secret, and webhook secret are server-only. They
  are never included in a page payload or sent to a client component.
- Webhook deliveries are verified with HMAC SHA-256 against the app's webhook secret
  (and `GITHUB_WEBHOOK_SECRET` when set) using a timing-safe comparison.
- `/api/cron/sync` is protected by `CRON_SECRET` when that variable is set. Set it in
  production.

## Known gaps

- **No rate limiting** on public endpoints (changelog subscribe, auth). Add one before
  a public launch; Better Auth's `sentinel()` plugin covers the auth surface.
- **Roles are coarse.** `member` and `admin` differ only for team management; both can
  edit and publish releases.
- **Invites create the user record immediately** rather than sending an invitation
  email with a token. The invited person can sign in with that email, but they are not
  emailed by Relay yet.
