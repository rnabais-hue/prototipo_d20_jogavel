# GitHub Pages Playtest Preview Closeout V1

## Outcome

Task 09 publishes the validated Vite production build as a public, non-commercial GitHub Pages
project site:

`https://rnabais-hue.github.io/prototipo_d20_jogavel/`

The authoritative repository is public and non-commercial by decision 0059.

## Delivered

- A dedicated GitHub Pages workflow validates, builds, uploads, and deploys `dist/`.
- Production uses the `/prototipo_d20_jogavel/` project-site base.
- Existing visual catalog paths remain rooted at `/assets/`; the Phaser loader resolves that
  generic catalog contract against Vite's deployment base at runtime.
- Focused tests cover local-root, Pages-base, normalized-base, and non-catalog path behavior.
- No gameplay, content, control, dependency, or lockfile change was made.

## Distribution boundary

Decision 0058 authorized the public playtest, and decision 0059 subsequently authorized public
repository visibility for hosting on the current GitHub plan. Neither decision authorizes
package publication, commercial use, or future commercial assets without a fresh license and
repository-access review. Asset provenance remains recorded in `public/assets/PROVENANCE.md`.

## Validation

- GitHub Actions run `30266144935` completed both `build` and `deploy` jobs successfully.
- The workflow passed 60 test files and 469 tests, typecheck, and production build before
  uploading the artifact.
- The published page, JavaScript bundle, stylesheet, combat map JSON, modular player sprite,
  and `PROVENANCE.md` each returned HTTP 200.
- The live URL was verified before this closeout was marked complete.
