---
name: architecture-decision-framework
description: >
  Structured framework for proposing and justifying implementation approaches.
  Use whenever a non-trivial implementation decision is being made (new
  feature, refactor, choice between libraries/patterns) and there is more
  than one reasonable way to solve it. Not for trivial or single-obvious-
  solution changes.
---

# When this applies

Trigger this for decisions where a wrong or short-sighted choice would be
expensive to reverse later: new data model, new abstraction shared across
slices, choice of state management approach, new external dependency,
anything touching the workflow-editor core or Telegram runtime.

Do NOT apply this to trivial, single-obvious-answer changes (fixing a typo,
adding a prop, a one-line bug fix) — forcing this format there is noise, not
rigor.

# Required output shape

1. **Problem framing** — one or two sentences: what is actually being solved,
   and what constraint makes it non-trivial (scale, existing architecture,
   team size, etc.)

2. **Options** (2-3, rarely more) — for each:
   - Name it concretely (not "Option A" — "Denormalized read model" etc.)
   - One-line description
   - Scalability impact: what happens as data/users/nodes grow
   - Maintainability impact: what this costs the next person touching it
   - Effort/risk: rough size, and what could go wrong

3. **Recommendation** — pick one, and justify it with a direct link back to
   this project's actual constraints (FSD boundaries, current team size,
   roadmap priority, existing patterns already in the codebase) — not
   generic best-practice language. "This fits because X in this codebase
   already does Y" beats "this is a common pattern."

4. **What would change the recommendation** — one sentence: under what
   future condition (10x scale, multi-tenant, team grows) would the answer
   be different. This signals it's a reasoned trade-off, not a guess.

# Anti-patterns to avoid

- Don't present a "straw-man" option just to make the recommended one look
  better — every option must be something you'd actually be willing to ship.
- Don't recommend the most complex/"enterprise" option by default — match
  complexity to the project's actual current stage (production app, not
  pet project, but also not a 50-engineer org — see project context).
- Don't hide behind "it depends" — always end with a concrete recommendation.
