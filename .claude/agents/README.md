# Claude Code subagents — Elemnt Rentals

These subagents are the **Claude Code adapter** for the role-based workflow defined in
[`.context/07_ai/`](../../.context/07_ai/). The `.context/07_ai/<role>/` folders remain the **canonical
role specifications**; each agent file here is a thin operational definition that links back to them, so
there is a single source of truth.

## Roles

| Subagent | Model | Use it for | Writes to | Engine |
|----------|-------|-----------|-----------|--------|
| [`backend-agent`](backend-agent.md)   | opus   | API/DB/service/migration work | `backend/`, `.context/{01_database,02_integrations,03_api,05_backend}` | — |
| [`frontend-agent`](frontend-agent.md) | sonnet | UI/pages/i18n/API consumption | `frontend/`, `.context/06_frontend` | — |
| [`security-agent`](security-agent.md) | opus   | pre-ship security audit        | `.context/04_security` + reports | `/security-review` + domain |
| [`qa-agent`](qa-agent.md)             | sonnet | verify a feature before release| reports only | `/verify`, `/code-review` + domain |

The **architect** role is now a slash command, not an agent — run
[`/consolidate-session`](../commands/consolidate-session.md) at the end of a session to turn handoffs
into an ADR. Consolidation is a deliberate, human-triggered step, so a command fits better than an
autonomous agent.

### Why these models
- **opus** for `backend-agent` and `security-agent` — both touch the highest-stakes, subtlest reasoning:
  audit-critical financial/settlement math and contracts (backend), and IDOR / privilege-escalation /
  data-leakage analysis (security). Errors here are expensive and hard to catch later.
- **sonnet** for `frontend-agent` and `qa-agent` — high-throughput, lower-subtlety work (UI, i18n,
  driving the review skills). Fast and cost-efficient.
- A subagent's model is fixed in its frontmatter, but the orchestrator can **override per dispatch**
  (e.g. run `qa-agent` on opus when verifying financial math, or `backend-agent` on sonnet for trivial
  CRUD) via the `model` parameter on the `Task`/Agent call.

## How this differs from the original `.context/07_ai/` workflow

The original workflow assumed **separate manual chat sessions** per role with markdown handoffs that a
human/architect consolidated. Under Claude Code:

- **Boundaries are write-scoped, not read-scoped.** A subagent's frontmatter limits *tools*, not which
  paths it can read — and reading across subsystems (e.g. backend reading the frontend API client to
  match a contract) is useful. Each agent lists what it **must not modify**; treat read access as open.
- **qa/security delegate to built-in skills.** They run `/verify`, `/code-review`, `/security-review`
  as the engine and add domain knowledge (financial rules, RBAC, i18n) on top — they don't reimplement
  generic review.
- **Handoffs are for substantial sessions only.** When work is grouped into a numbered session
  (`.context/07_ai/sessions/session_XXX/`), the agent writes its `*_handoff.md`; trivial one-off
  delegations don't need the ceremony — the orchestrator already sees the result.

## Delegating

From the main session, route role-shaped work to the matching agent:

```
Task(subagent_type="backend-agent",  prompt="Add an endpoint to ... per .context/03_api/endpoints.md")
Task(subagent_type="frontend-agent", prompt="Build the admin page for ... per the design spec")
Task(subagent_type="security-agent", prompt="Audit the reservations endpoints before release")
```

Agents must **stop and ask** rather than invent business rules, financial math, API contracts, or user
flows. Conflict order when docs disagree: domain > database > api > architecture.
