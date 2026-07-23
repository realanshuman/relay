# Relay — Product Requirements (V1.5)

**Status:** Vision / scope locked for V1.5
**One-liner:** Relay is the AI Release Manager that turns every merged pull request into a polished product release.

---

## 1. The V1.5 philosophy

Relay is **not** a tiny MVP and **not** an enterprise platform. It is a **V1.5**: something
that looks polished, feels complete, and does **one core workflow** exceptionally well.

The trap we are deliberately avoiding: trying to be Linear + LaunchNotes + GitHub + Buffer +
Notion AI + Docs + a marketing suite all in version one. That is a massive product. Instead,
V1.5 picks the single most valuable loop and makes it feel magical.

### The one workflow

> You merge a PR. Relay understands your release. You review it. You publish it.

That's it. Everything else in the product exists only to serve that loop.

```
Developer merges PR
        ↓
Relay detects release
        ↓
AI understands commits
        ↓
AI generates release assets
        ↓
User reviews
        ↓
Publish
        ↓
Customer Release Page
```

### Product principles

1. **Automatic by default.** Detection and drafting happen without the user asking.
2. **AI is invisible.** The user never configures agents, models, or pipelines. They click **Generate**.
3. **One workflow, done well.** No competing surfaces, no settings mazes.
4. **Polished, not minimal.** Every screen should feel finished, in the spirit of Linear.
5. **Editable everything.** AI proposes; the human approves. Every generated section can be edited before it ships.

---

## 2. Positioning

Do **not** market Relay as a "changelog generator." Market it as:

> **Relay is the AI Release Manager that turns every merged pull request into a polished product release.**

That single sentence explains the product, highlights the automation, and leaves room to
grow into documentation, customer communication, and release operations over time without
overwhelming the first version.

---

## 3. Information architecture

The entire app is **five** navigation items. That's the whole sidebar.

```
🏠 Dashboard
🚀 Releases
📦 Repositories
🌐 Public Changelog
⚙️ Settings
```

No Documentation tab. No Support tab. No AI Agents tab. No Risk Dashboard. No Roadmaps.
Those either happen automatically behind the scenes or are deferred past V1.5.

---

## 4. Screens

### 4.1 Dashboard

The home surface. A small set of at-a-glance cards on top, a recent-activity table below.

**Cards**

| Card | Shows |
| --- | --- |
| Repositories | Count of connected repos |
| Releases this month | Rolling count |
| Latest Deployment | Most recent published release |
| AI Credits | Remaining generation credits |
| Publishing Status | Health / last publish result |

**Latest Releases (table)**

| Column | Notes |
| --- | --- |
| Repository | Which repo the release came from |
| Status | Draft / Generating / Ready / Published |
| Risk | Lightweight signal (see §5.4) |
| Published | Date, or "—" if not yet |
| Open → | Link into the release detail |

The feel is Linear: quiet, dense, fast, obviously scannable.

### 4.2 Repositories

Connect GitHub, then list the connected repositories (e.g. Website, Backend, Dashboard, API).

Each repository row shows **only**:

- Connected (status)
- Latest Commit
- Latest Release
- Branch (the release/target branch)
- Auto Publish (on/off)

Nothing more. No per-repo settings sprawl.

### 4.3 Releases (the core of the product)

**List view** — every release shows:

- Version
- Repository
- Release Date
- AI Status (e.g. Draft / Generating / Ready)
- Publish Status (Unpublished / Published)

**Detail view** — clicking a release opens exactly **four tabs**:

```
Overview   |   Release Notes   |   Marketing   |   Publish
```

There is no Documentation tab, no Support tab, and no AI Agents tab. Those things either
happen automatically or are out of scope for V1.5.

#### Overview
A summary of the release: version, repo, date, risk signal, AI confidence, and the
commit set that feeds generation.

#### Release Notes
The customer-facing written assets, all editable:

- ✨ What's New
- Bug Fixes
- Performance
- Breaking Changes
- Migration Notes

#### Marketing
The announcement assets, all editable:

- Social Posts — Twitter, LinkedIn, Telegram, Discord
- Banner — a generated image

#### Publish
One screen to ship it (see §6).

### 4.4 Public Changelog

The workspace's branded, public release page (see §7). This nav item manages its content,
appearance, and domain.

### 4.5 Settings

Deliberately small:

```
Workspace
GitHub
Team
Billing
API Keys
Branding
```

---

## 5. The AI pipeline

### 5.1 Invisible agents, one button

Internally, generation is a pipeline of specialized steps:

```
Commit Analyzer → Translator → Marketing Writer → Image Generator → Publisher
```

- **Commit Analyzer** — reads the commit/PR set and extracts what actually changed.
- **Translator** — turns engineering-speak into clear, customer-facing language.
- **Marketing Writer** — drafts the social posts and email announcement.
- **Image Generator** — produces the banner image.
- **Publisher** — assembles and pushes the final assets to selected channels.

**The user never sees these agents.** They click a single button:

```
Generate
```

### 5.2 AI outputs

Every release generates exactly this set — enough to feel complete, small enough to stay focused:

- ✅ Release Notes
- ✅ Changelog
- ✅ AI Summary
- ✅ Twitter
- ✅ LinkedIn
- ✅ Discord
- ✅ Telegram
- ✅ Email Draft
- ✅ Banner Image

Explicitly **not** generated in V1.5: Reddit, Product Hunt, FAQ, Documentation,
Troubleshooting, Migration Wizard. Those come later.

### 5.3 AI quality UX

Every generated asset shows a lightweight quality signal and offers quick refinements —
far better UX than exposing dozens of agent settings.

```
⭐⭐⭐⭐☆   92% Confidence
```

Refinement buttons on each asset:

```
Regenerate | Improve | Shorter | More Technical | More Customer Friendly
```

### 5.4 Risk signal

A lightweight, at-a-glance indicator surfaced on the Dashboard table and release Overview
(e.g. derived from breaking changes, migration notes, or change size). This is a **signal**,
not a full Risk Dashboard — the heavyweight version is out of scope.

### 5.5 AI infrastructure (hidden from the customer)

The customer should never think about models. Behind the scenes:

```
OpenRouter
    ↓
Gemini Flash
    ↓ (fallback)
DeepSeek
    ↓ (fallback)
Qwen
```

Model names, routing, and fallbacks are an implementation detail. Never surface them in the UI.

---

## 6. Publishing

One screen. Pick channels, hit publish.

```
Publish to
  ☑ Website        (the public changelog)
  ☑ Twitter
  ☑ LinkedIn
  ☑ Discord
  ☑ Telegram
  ☑ Email

[ Publish ]
```

The public changelog ("Website") is published directly by Relay. For social channels and
email, Relay produces **ready-to-copy or API-ready content** — full end-to-end auto-posting
to every third party is not a V1.5 requirement, though the content is prepared so it can be.

---

## 7. The public changelog

This is a genuine selling point, not an afterthought. Every workspace gets a branded page:

```
tryrelay.run/acme        or        updates.company.com
```

The page feels magical and reads top to bottom:

```
Version 2.3
⭐⭐ AI Summary
────────────────────
✨ What's New
Bug Fixes
Performance
Breaking Changes
Migration Notes
──────────────
Social Posts (Twitter / LinkedIn / Telegram / Discord)
──────────────
Banner (generated image)
──────────────
Publish
```

Public page requirements:

- **Latest release** front and center, plus full history
- **Version**, **What's New**, **Bug Fixes**, **Images**
- **Search** across releases
- **RSS** feed
- **Subscribe** (email updates)
- **Beautiful and SEO-optimized** — this drives organic discovery and is part of the pitch
- **Custom domain** support (e.g. `updates.company.com`)

---

## 8. Branding

Per-workspace branding applied to the public changelog:

- Logo
- Colors
- Favicon
- Custom domain

---

## 9. Scope

### 9.1 Features to build (V1.5)

These make Relay feel like a complete product without making it huge:

1. **GitHub Connection** — connect repositories and detect merges.
2. **Automatic Release Detection** — create a draft release whenever the target branch is updated.
3. **AI Release Generation** — produce release notes, changelog, summary, and announcements automatically.
4. **Release Editor** — review and edit every AI-generated section before publishing.
5. **Public Changelog Website** — branded page per workspace with search, RSS, and optional custom domain.
6. **Publishing** — publish to the public changelog and generate ready-to-copy / API-ready content for social channels and email.
7. **Release History** — a searchable timeline of every release.
8. **Branding** — workspace logo, colors, favicon, and custom domain for the public changelog.

### 9.2 Explicitly NOT in V1.5

Do not build:

- ❌ Jira
- ❌ Linear (integration)
- ❌ GitLab
- ❌ Bitbucket
- ❌ Multiple approval workflows
- ❌ AI Agent Builder
- ❌ Documentation AI
- ❌ Risk Dashboard (full)
- ❌ Roadmaps
- ❌ Feature Voting
- ❌ Analytics
- ❌ Complex Integrations

Every item above is a deliberate "later," not a "never." V1.5's job is to earn the right to build them.

---

## 10. Proposed data model

> _Proposed to make the vision buildable — not additional product scope. Adjust freely._

- **Workspace** — the tenant. Has branding (logo, colors, favicon), a public changelog slug/subdomain, and an optional custom domain.
- **User** / **Membership** — users belong to a workspace (Team settings).
- **Repository** — a connected GitHub repo. Tracks target branch, latest commit, latest release, connection status, and an `auto_publish` flag.
- **Release** — belongs to a repository. Has version, release date, commit set, AI status, publish status, risk signal, and AI confidence.
- **ReleaseAsset** — a single generated output belonging to a release (type ∈ {release_notes, changelog, summary, twitter, linkedin, discord, telegram, email, banner_image}). Stores the editable content, confidence score, and generation metadata.
- **PublishTarget** — a channel selection + result for a release (website, twitter, linkedin, discord, telegram, email).
- **Subscriber** — an email subscriber to a workspace's public changelog.

---

## 11. What "done" looks like for V1.5

> _Proposed acceptance criteria._

1. A user connects a GitHub repo in under a minute and sees it listed with its status.
2. Merging into the target branch automatically produces a **draft release** — no manual trigger.
3. One click on **Generate** produces all nine AI outputs, each with a confidence signal and refinement buttons.
4. The user can edit any section and **Publish** to a branded public changelog.
5. The public changelog is live at `tryrelay.run/<workspace>`, is searchable, has an RSS feed, supports email subscribe, and can be mapped to a custom domain.
6. Social/email content is generated and ready to copy or post via API.
7. Every release is retained in a searchable history.

---

## 12. Beyond V1.5 (roadmap seeds)

Once the core loop is loved, the natural expansions — none of which V1.5 should wait on:

- More channels: Reddit, Product Hunt
- Documentation AI, FAQ, Troubleshooting, Migration Wizard
- Full auto-posting to every social channel
- More source integrations: GitLab, Bitbucket, Jira/Linear context
- Approval workflows, analytics, roadmaps, feature voting, and a full risk dashboard

The point of V1.5 is to make the single release workflow feel magical first, then grow.

---

## 13. Open questions

> _To resolve before or during build — not blockers to the vision._

1. **Release granularity:** is a "release" one merged PR, or a batch of merges into the target branch between publishes? (Affects detection and version assignment.)
2. **Versioning:** where does the version number come from — Git tags, semantic-release, or Relay-assigned?
3. **Auto Publish semantics:** when `auto_publish` is on, do we generate-and-publish with no human in the loop, or generate-and-notify?
4. **Email delivery:** which provider backs the Subscribe feature and email drafts?
5. **Custom domains:** verification and TLS approach for `updates.company.com`.
6. **AI credits:** what counts as a credit, and how does billing meter generation?
