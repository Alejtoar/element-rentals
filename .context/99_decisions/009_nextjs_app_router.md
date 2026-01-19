# ADR 009: Adoption of Next.js App Router

## Status
Accepted

## Context
The initial frontend architecture specified a React Single Page Application (SPA) using Vite or Create React App. However, during the implementation of the MVP Landing Page (Session 005), the team re-evaluated the requirements for SEO, performance, and developer experience.

## Decision
We decided to adopt **Next.js with App Router** as the primary frontend framework instead of a pure SPA.

- **Framework**: Next.js 15+ (App Router).
- **Rendering**: Hybrid approach (Server Components for static content, Client Components for interactivity).
- **Deployment**: Node.js-based or Static Export (to be determined).

## Alternatives Considered
- **Vite (SPA)**: Highly performant for dashboards but requires additional configuration for SEO (SSR) and routing. **Rejected** because Next.js provides a more comprehensive out-of-the-box solution for marketing searchability.
- **Next.js (Pages Router)**: The legacy routing system for Next.js. **Rejected** in favor of the more modern and efficient App Router paradigm.

## Consequences
### Positive
- **SEO Optimization**: Automatic server-side rendering for property listings and landing pages.
- **Routing**: Built-in support for layouts, loading states, and error boundaries.
- **Performance**: Improved Core Web Vitals via automatic image optimization and code splitting.

### Negative
- **Complexity**: Requires understanding of Server vs. Client component boundaries.
- **Migration**: Existing SPA-specific libraries may need adaptation for Server Components.

## References
- `.context/07_ai/sessions/session_005/frontend_handoff.md`
- `frontend/src/app/`
