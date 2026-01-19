# ADR 011: Lightweight Dynamic i18n Strategy

## Status
Accepted

## Context
The platform requires support for at least English and Spanish. Standard Next.js i18n solutions often involve heavy dependencies or complex configurations for the App Router.

## Decision
We decided to implement a **lightweight, dictionary-based i18n strategy** integrated with Next.js dynamic routing.

- **Routing**: Standard `[lang]` dynamic segment in the root folder.
- **Dictionaries**: Simple JSON files located in `src/locales/`.
- **Retrieval**: A utility function to load dictionaries on the server side and pass them to components.
- **Middleware**: Used to detect language and redirect to the default locale (`es`).

## Alternatives Considered
- **next-intl**: A popular library for Next.js i18n. **Rejected** to keep the project "dependency-light" and maintain full control over the translation payload.
- **Client-side only i18n**: Using `react-i18next` with local storage. **Rejected** because it breaks SSR/SEO for localized content.

## Consequences
### Positive
- **Performance**: Zero runtime bundle overhead for the i18n library itself.
- **SEO**: Fully crawlable localized URLs (e.g., `/es/propiedades`, `/en/properties`).
- **Simplicity**: Easy to understand and extend by adding new JSON files.

### Negative
- **Manual Work**: Requires manual implementation of features like pluralization or date formatting if needed in the future.
- **Type Safety**: Requires custom types to ensure dictionary keys exist.

## References
- `.context/07_ai/sessions/session_005/frontend_handoff.md`
- `frontend/src/middleware.ts`
- `frontend/src/locales/`
