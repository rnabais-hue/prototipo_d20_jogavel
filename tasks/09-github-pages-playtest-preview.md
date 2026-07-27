# Task 09: GitHub Pages Playtest Preview

## Status

Complete. The implementation, initial Pages enablement, and public-repository authorization
were merged through dedicated pull requests. The live deployment is recorded in
`docs/GITHUB_PAGES_PLAYTEST_PREVIEW_CLOSEOUT_V1.md`.

## Objective

Publish the current browser prototype as a public, non-commercial GitHub Pages project site
from the public authoritative repository.

The deployment must reproduce the validated production build. It must not change game rules,
content data, controls, statistics, combat outcomes, dependencies, or the lockfile.

## Required reading

1. `AGENTS.md`
2. `docs/ARCHITECTURE.md`
3. `tasks/README.md`
4. the last 12 entries of `docs/DECISIONS.md`
5. `README.md`
6. this file

There is no `CONTEXT.md` in `src/game/` or `src/game/visual/`.

## Scope

- Add a GitHub Actions workflow that builds and deploys `dist/` through GitHub Pages.
- Run the repository validation gate before uploading the Pages artifact.
- Configure Vite's production base for the repository project-site path.
- Resolve existing `/assets/` catalog entries against Vite's deployment base only at the
  Phaser loading boundary. Keep catalog data provider-neutral and unchanged.
- Add focused tests for deployment-base path resolution.
- Document the public preview, its narrow distribution authorization, and the final URL.

## Distribution boundary

- The repository and Pages output are public and non-commercial.
- Public visibility permits access, cloning, indexing, and forking, but is not package
  publication or permission for commercial use.
- Only original project expression and assets whose provenance records permit public web use
  may enter the deployed artifact.
- Future purchased assets require their own license and repository-access review before they
  may enter the preview.
- This task does not authorize trademarked setting content, official art, verbatim rules text,
  or any other material forbidden by `AGENTS.md`.

## Acceptance criteria

1. No dependency declaration or lockfile changes.
2. `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
3. Existing visual catalog paths remain unchanged.
4. Local development continues at `/`, while production HTML and visual runtime assets resolve
   under `/prototipo_d20_jogavel/`.
5. The workflow uses the `github-pages` environment and least-privilege Pages permissions.
6. The deployed site loads the game and its runtime assets without a root-path 404.
7. The final Pages URL is recorded in the closeout and current-state documents.
8. The unrelated local `.claude/settings.local.json` change is not staged or committed.

## Out of scope

- Gameplay, visual-direction, content, or control changes.
- A custom domain, analytics, authentication, backend, save service, or private access gateway.
- Dependency upgrades or new packages.
- Publishing the repository, source, npm package, or commercial asset bundle.
