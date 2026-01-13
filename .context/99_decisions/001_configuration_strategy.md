# ADR 001: Configuration Strategy

## Status
Accepted

## Context
The application requires handling sensitive configuration (secrets, keys, database URLs) across different environments (Local Development, Testing, Production).

We evaluated two main approaches:
1. **Multiple .env files**: Using `.env.dev`, `.env.prod`, `.env.test` managed by git (encrypted) or manually.
2. **Single .env + Injection**: Using a single `.env` for local development (gitignored) and relying on platform-level environment variable injection for production (Docker, Kubernetes, CI/CD).

## Decision
We decided to use **`pydantic-settings` with a single `.env` file** for local development.

- The `.env` file is strictly for local overrides and is included in `.gitignore`.
- In Production/Staging, we will **NOT** use `.env` files. Instead, configuration will be injected as standard system environment variables. `pydantic-settings` automatically prioritizes system environment variables over `.env` file content.

## Consequences
### Positive
- **Security**: Secrets are never committed to the repo in any form (even encrypted .env files can be risky if keys leak).
- **Simplicity**: Developers only need one `.env` file locally.
- **Standards**: Follows 12-Factor App methodology (Configuration stored in the environment).
- **Flexibility**: Production deployment is decoupled from file-based configuration.

### Negative
- **Setup**: Developers must manually create their `.env` file from a provided template (`.env.example` or similar) when setting up the project.
- **Visibility**: It is harder to "see" production config in one place (it lives in the platform dashboard/secrets manager).

## References
- `backend/app/config.py` implementation.
- Session 001 Security Handoff.
