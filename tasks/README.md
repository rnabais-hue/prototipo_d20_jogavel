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
- Publishing a branch or opening a pull request does not require the local GitHub CLI. Prefer
  the connected GitHub App/connector for pull-request operations; use `gh` only as an optional
  fallback when it is already available. A missing local `gh` executable is not a blocker.

## Validation gate

Unless the task file says otherwise, a task is complete only when all three pass:

```
run test
run typecheck
run build
```

Use the package manager declared in `package.json` under `packageManager`. The known
non-blocking warning is the production chunk above 500 kB.

The test suite baseline is **58 files, 457 tests**. A refactor that changes these numbers has
changed behaviour and has failed, unless the task file explicitly authorises the change.

## Execution order

| File | Purpose | Depends on |
| --- | --- | --- |
| `00-version-control-and-toolchain.md` | Git, line endings, reproducible toolchain | — |
| `01-dependency-inversion-refactor.md` | Move content out of the CLI layer | 00 |
| `02-documentation-sync.md` | Make `README.md` and `MVP_SCOPE.md` true again | 01 |
| `03-continuous-integration.md` | Enforce the validation gate mechanically | 00 |
| `04-content-identifiers-as-data.md` | Content ids become data, not closed types | 01 |
| `05-reconcile-content-models.md` | Reconcile the two parallel content models | 04, 06 |
| `06-move-resolution-out-of-content.md` | Sheet resolution logic leaves the content pack | 04 |
| `07-combat-visual-direction-vertical-slice.md` | Prove the modular pixel-art direction in combat | 05, 06 |
| `08-modular-character-visual-breadth.md` | Prove modular character identity and facing breadth | 07 |
| `09-github-pages-playtest-preview.md` | Publish the validated browser build as a Pages preview | 08 |

Tasks 00 through 08 are complete and merged. Task 09 is in progress on its dedicated branch.

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

**Phase D — prove the visual direction.** Task 07. Deliver a combat-only modular pixel-art
vertical slice before applying the direction to exploration.

**Phase E — prove modular character breadth.** Task 08. Demonstrate distinct character
identities, data-composed equipment layers, and the cardinal facings required by board movement
without changing mechanics or introducing inventory.

**Phase F — publish the playtest preview.** Task 09. Produce the same validated Vite build under
the GitHub Pages project-site base path and deploy it without changing gameplay or publishing
the private repository.

**Deferred, deliberately.** `src/game/scenes/PrototypeScene.ts` is 1507 lines and orchestrates
exploration, combat, HUD, console, menu, camera, layout and input. Splitting it is real work
with real regression risk that the test suite cannot catch, because almost nothing in it is
testable without a browser. It waits until Phase C lands and version control has proven itself.
A linter and formatter are deferred for the same reason: introducing one now would produce a
diff large enough to bury the history at exactly the moment the history starts.

## Writing acceptance criteria

A criterion is only useful if it is mechanically checkable **and** actually satisfiable. Three
criteria written for tasks 04 and 06 failed that bar and cost two agent stops and one
documented discrepancy. The failures rhyme, so the rules below are cheap insurance:

1. **Run the command against the current tree before putting it in a task file.** A grep that
   already fails on the main branch is not a criterion, it is a trap. Task 06's
   `grep -v "from './"` flagged `../rules/` imports that the architecture explicitly permits,
   and it failed on the main branch before the task ever started.
2. **Beware homonyms.** A bare literal grep cannot tell two concepts apart when they share a
   spelling. Task 04 banned `'melee'` without noticing it names both a content skill id and an
   engine weapon range band.
3. **State the invariant, not a proxy for it.** "No engine production code branches on a
   literal content id" survives refactors; "this token appears nowhere" does not.
4. **One concern per task.** Task 04 bundled "identifiers become data" with "resolution logic
   leaves the content pack", which made two of its own criteria mutually unsatisfiable. The
   second concern became task 06 and went through cleanly on its own.

When an agent reports that criteria collide, the default assumption is that the specification
is wrong, not the agent. Fix the task file, commit the fix, then resume.

## Recurring audit

Every two to three milestones, run an architectural audit with a model that did not write the
recent code. Tests verify behaviour; audits verify structure, and structural drift is invisible
to a green suite. The dependency inversion corrected by task 01 existed for weeks with 430
passing tests.
