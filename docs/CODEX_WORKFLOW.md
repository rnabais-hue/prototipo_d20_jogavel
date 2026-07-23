# Codex Workflow

This project is a local and private **custom d20-inspired tactical RPG prototype**. Codex agents should keep work small, explicit, and aligned with the current task.

## Before Changing Files

1. Read `AGENTS.md`.
2. Read the relevant docs in `docs/`.
3. Inspect the current file tree.
4. Confirm whether the task is documentation-only, rules-only, UI-only, or gameplay-related.

## While Working

- Do not add features outside the user request.
- Do not create gameplay code during documentation tasks.
- Do not put Phaser imports in `src/rules/`.
- Do not add official IP, official names, official lore, official text, official rules text, or official art.
- Prefer pure functions and tests for future rule work.
- Keep Phaser code in `src/game/` or presentation-adapter layers.

## Validation

Run these before handoff when code or config changes are made:

```bash
npm run test
npm run typecheck
npm run build
```

For documentation-only changes, at minimum verify that the requested files exist. If docs include command or architecture guidance, keep it consistent with `package.json` and the current `src/` layout.

## Handoff Notes

Summaries should include:

- Files created or changed.
- Whether gameplay code was untouched.
- Validation performed.
- Any environment limitation, such as missing global Node/NPM.
