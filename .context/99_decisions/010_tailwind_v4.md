# ADR 010: Tailwind CSS v4 Adoption

## Status
Accepted

## Context
A modern CSS utility framework is required for rapid UI development and maintaining a premium design system. Tailwind CSS was pre-selected, but the specific version was not specified in initial docs.

## Decision
We decided to use **Tailwind CSS v4** for the frontend styling.

- **Configuration**: Native CSS-based configuration (using `@theme` in CSS instead of `tailwind.config.js`).
- **Engine**: Lightning CSS for faster builds and modern CSS features.

## Alternatives Considered
- **Tailwind CSS v3**: The stable and widely used version. **Rejected** to leverage the performance gains and streamlined configuration of the latest version.
- **Styled Components / Emotion**: CSS-in-JS solutions. **Rejected** to avoid runtime overhead and better align with Next.js Server Components.

## Consequences
### Positive
- **Build Speed**: Significant reduction in CSS processing time.
- **CSS Literals**: Ability to define theme variables directly in CSS.
- **Future Proofing**: Alignment with the latest web standards.

### Negative
- **Breaking Changes**: Some v3 utility classes or configuration patterns are different or deprecated.
- **Stability**: As a newer version, it may encounter integration bugs (e.g., the `border-border` utility issue identified in Session 005 and resolved in Session 006).

## References
- `.context/07_ai/sessions/session_005/frontend_handoff.md`
- `.context/07_ai/sessions/session_006/frontend_handoff.md`
- `frontend/src/app/globals.css`
