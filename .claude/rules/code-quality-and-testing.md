---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Code Quality

Follow the project's existing ESLint config, Prettier config, TypeScript
config, naming conventions, folder structure.

Prefer readable code over clever code.

Keep: functions small and focused, files cohesive, responsibilities
explicit, abstractions justified.

Avoid: unnecessary abstractions, duplicated business logic, premature
optimization, unrelated refactoring, clever code that reduces readability.

## Code generation

When generating or modifying code: provide complete, valid implementations.
Never use placeholders such as `// ... rest of the code`. Never leave
`// TODO` or `// Implement later` in place of requested functionality.
Preserve existing project conventions. Don't silently change unrelated
behavior.

## Testing

The project uses Vitest, React Testing Library, Playwright.

When adding or modifying meaningful business behavior, add or update
relevant tests. Prioritize tests for: Zustand store behavior, workflow
mutations, workflow validation, node creation, node cloning, workflow
serialization, Telegram runtime engine, Telegram node handlers, Zod
validation schemas, non-trivial domain logic.

Tests should verify behavior rather than implementation details. Don't
create tests solely to increase coverage numbers.

## React testing

Use React Testing Library for meaningful user-facing component behavior.
Avoid testing implementation details that don't affect user behavior.

## End-to-end testing

Use Playwright for critical end-to-end user flows: authentication, creating
a workflow, editing a workflow, publishing a bot, critical Telegram bot
flows.

## No magic numbers or strings

Never hard-code numeric or string literals that carry meaning — always
extract them into a named constant, even if used only once.

Bad:
```ts
if (retryCount > 3) { ... }
setTimeout(fn, 30000);
if (user.role === "admin") { ... }
```

Good:
```ts
const MAX_RETRY_ATTEMPTS = 3;
const WORKFLOW_TIMEOUT_MS = 30_000;
const ROLE_ADMIN = "admin";

if (retryCount > MAX_RETRY_ATTEMPTS) { ... }
setTimeout(fn, WORKFLOW_TIMEOUT_MS);
if (user.role === ROLE_ADMIN) { ... }
```

Why: a bare `3` or `30000` gives no signal of *why* that value was chosen or
where else it might need to change. A named constant documents intent and
gives one place to change it. Applies to thresholds, timeouts, retry
counts, magic string keys/roles/statuses, array indices with meaning, and
HTTP status codes used for logic branching.

Exceptions: `0`, `1`, `-1` used as truly generic loop/array idioms
(`arr[0]`, `i + 1`, `array.length - 1`) don't need a constant — only extract
values that encode a *decision*, not language idiom.

Place shared constants in the appropriate FSD layer (`shared/config` or the
relevant slice's `config.ts`) — not inline in component files, unless the
constant is truly local to that one file only.
