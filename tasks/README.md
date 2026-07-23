# Task Dispatch Protocol

This folder holds **task specifications** handed to AI coding agents. It is not product
documentation. Product documentation lives in `docs/`.

The project is developed by rotating between different AI models. No model carries memory
between sessions, and no model shares memory with another. **This repository is the only
memory that exists.** Every task specification here is written so that a cold agent, with no
prior context, can execute it correctly by reading one file plus the mandatory core below.

## Mandatory reading order for any agent

Before touching anything, in this order:

1. `AGENTS.md` — non-negotiable rules (IP, layering, scope discipline).
2. `docs/ARCHITECTURE.md` — layer boundaries, engine/content split, context compartments.
3. `docs/DECISIONS.md` — numbered decision log. Read the last 10 entries at minimum.
4. `README.md` — current implemented state.
5. `CONTEXT.md` of every `src/` directory the task touches, if present.
6. The single task file being executed.

Do not read the full `docs/` tree by default. It exceeds 250 KB and most of it is historical
closeout record. Read a closeout only when the task points to it by name. This is the three-tier
context model defined in decision 0049: core, compartment, archive.

## Rules for every task

- One task per branch, one branch per pull request. Never combine task files.
- Never change behaviour during a refactor task. Never write code during a documentation task.
- Every task file states objective acceptance criteria. If a criterion cannot be met, stop and
  report. Do not adapt tests or relax criteria to make a task pass.
- Every task that changes architecture appends a new numbered entry to `docs/DECISIONS.md`,
  following the existing `Decision:` / `Reason:` format.
- All text written into this repository is in English, regardless of the language of the prompt.

## Validation gate

Unless the task file says otherwise, a task is complete only when all three pass:

```
run test
run typecheck
run build
```

Use the package manager declared in `package.json` under `packageManager`. The known
non-blocking warning is the production chunk above 500 kB.

The test suite baseline is **56 files, 430 tests**. A refactor that changes these numbers has
changed behaviour and has failed, unless the task file explicitly authorises the change.

## Execution order

| File | Purpose | Depends on |
| --- | --- | --- |
| `00-version-control-and-toolchain.md` | Git, line endings, reproducible toolchain | — |
| `01-dependency-inversion-refactor.md` | Move content out of the CLI layer | 00 |
| `02-documentation-sync.md` | Make `README.md` and `MVP_SCOPE.md` true again | 01 |
| `03-continuous-integration.md` | Enforce the validation gate mechanically | 00 |
| `04-content-identifiers-as-data.md` | Content ids become data, not closed types | 01 |
| `05` — not yet written | Reconcile the two parallel content models | 04 |

Task 03 is optional but recommended before further multi-model work. Documentation is
advisory; continuous integration is binding.

## Plan of record

**Phase A — make the repository safe to change.** Tasks 00 and 03. Version control, a
reproducible toolchain, and a binding validation gate. Nothing here touches game code. Until
this is done, every refactor is unreviewable and unrevertible.

**Phase B — correct the boundaries.** Tasks 01 and 02. The combat layer stops depending on the
terminal harness, and the documents stop describing a project that no longer exists.

**Phase C — make content extensible.** Tasks 04 and 05. Content identifiers become data, the
content pack gains load-time validation, and the two parallel content models are reconciled
into one. This is the phase that decides whether the project scales, and it is governed by
decisions 0047 and 0048.

**Deferred, deliberately.** `src/game/scenes/PrototypeScene.ts` is 1507 lines and orchestrates
exploration, combat, HUD, console, menu, camera, layout and input. Splitting it is real work
with real regression risk that the test suite cannot catch, because almost nothing in it is
testable without a browser. It waits until Phase C lands and version control has proven itself.
A linter and formatter are deferred for the same reason: introducing one now would produce a
diff large enough to bury the history at exactly the moment the history starts.

## Recurring audit

Every two to three milestones, run an architectural audit with a model that did not write the
recent code. Tests verify behaviour; audits verify structure, and structural drift is invisible
to a green suite. The dependency inversion corrected by task 01 existed for weeks with 430
passing tests.
