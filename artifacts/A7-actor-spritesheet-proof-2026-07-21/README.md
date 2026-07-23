# A7 Actor Spritesheet Proof — Human Gate

Status: **Candidate / proof-only**. Nothing in this package is approved or integrated. No file was copied to `public/assets`, no catalog entry changed, and no runtime loading was enabled.

## Audit result

- The approved P2R1 player and M2 enemy are 256×256 RGBA masters, logical 32×32, anchor `(0.5, 0.82)`, approved feet baseline near `y=210`.
- Runtime actor rendering currently creates static sprites inside combatant/exploration containers. Presentation states are expressed through cancellation-safe container tweens (`movement`, `anticipation/lunge`, `hit/miss`, `defeat`) rather than frame animations.
- Rules resolve instantly and deterministically before presentation. Resize/reset/cancel invalidates queued callbacks, stops active tweens, and snaps containers to authoritative cells.
- Uniform spritesheets are supported by the loader, but no actor frame-animation controller is currently integrated. These sheets deliberately do not alter that architecture.
- M2 remains visibly unarmed despite the separate equipment-label divergence; this package does not invent a weapon or alter content.

## Proposed frame specification

Every state contains three uniform 256×256 RGBA frames. Full sheets are 768×1280 (3 columns × 5 state rows, 15 frames). Row order: idle, movement, attack, hit, defeat.

| State | Semantic order | Proposed timing | Loop |
| --- | --- | ---: | --- |
| Idle | subtle in / center / subtle out | 400 ms each; ping-pong `0,1,2,1` | yes |
| Movement | left contact / passing / right contact | 100 ms each | yes during movement |
| Attack | wind-up / compact action / recovery | 80 / 100 / 70 ms | no |
| Hit | brace / recoil / recovered center | 40 / 70 / 40 ms | no |
| Defeat | stagger / collapse / final hold | 90 / 100 / 110 ms | no; hold final |

The attack, hit, and defeat totals align with the existing 250 ms anticipation+lunge envelope, 150 ms impact reaction, and 300 ms defeat sequence. This is a proposal only; integration would require a later approved milestone and must retain cancellation-safe tweens.

## Animated GIF review

The GIFs are proof-only previews on `#10141B`; they are not runtime assets. Each state has a 256×256 master preview and a 32 px logical reduction enlarged to 256×256 with nearest-neighbor so the real small-scale result can be inspected.

- Player: `player/proofs/animated/` — idle, movement, attack, hit, defeat.
- Enemy: `enemy/proofs/animated/` — idle, attack, hit, defeat.
- Enemy movement is intentionally omitted because the current enemy has no gameplay movement capability. Implementing that capability would be a separate gameplay milestone, not an A7 art integration step.

## Technical results

- All 30 frames are non-empty 256×256 RGBA PNGs.
- All alpha bounds are horizontally centered and end at `y=209`, corresponding to the documented baseline `y=210`.
- Topmost alpha is `y=10` or lower in every actor set; no frame touches an outer edge.
- Opaque corner count: 0. Visible magenta-like contaminated pixels (`A>8`, high R/B, low G): 0.
- Player approved static alpha bounds: 123×198. Player candidate ranges: width 101–152, height 73–200; pose-dependent collapse accounts for the low defeat height.
- Enemy approved static alpha bounds: 110×200. Enemy candidate ranges: width 95–145, height 64–200.
- Player center-idle versus approved static: silhouette IoU `0.9299`; common-area RGB MAE `12.605/255`.
- Enemy center-idle versus approved static: silhouette IoU `0.7473`; common-area RGB MAE `35.049/255`.
- Detailed per-frame alpha bounds are in `diagnostics/frame-metrics.json`; all file hashes are in `SHA256SUMS.txt`.

## Independent recommendations

| Actor/state | Recommendation | Reason |
| --- | --- | --- |
| Player idle | Approve | Stable baseline, near-static silhouette, subtle readable motion. |
| Player movement | Revision Requested | Cycle reads, but the actor is about 5% shorter than the approved static and may appear to shrink. |
| Player attack | Approve | Compact sword action; no baked effect and conservative bounds. |
| Player hit | Approve | Clear temporary recoil with recovered center and no permanent displacement. |
| Player defeat | Approve | Coherent collapse, compact final pose, sword retained. |
| Enemy idle | Revision Requested | Center pose has material silhouette/value drift from M2 and reads smaller. |
| Enemy movement | Reject / Not Applicable | The current enemy cannot move; an animation must not imply an unsupported gameplay capability. |
| Enemy attack | Approve | Readable weapon-neutral shove, no invented equipment or baked effect. |
| Enemy hit | Revision Requested | First frame resembles the attack guard, weakening semantic distinction. |
| Enemy defeat | Approve | Clear intact-stone collapse without shattering, debris, or weapon. |

## Known limitations

The generator repainted pixels beyond literal joint motion. P2R1 remains recognizable, but this is not a pixel-exact rig. M2 varies more strongly between states. The proofs establish art candidates and technical packaging; they do not demonstrate runtime frame switching, overlap queues, resize, reset, or reduced-motion behavior.

## Human review checklist

- Compare each state against its approved static at 32, 22, 16, and 14 px.
- Check identity, silhouette, value grouping, and grayscale distinction.
- Check that feet/contact feel stable and no pose implies a different occupied cell.
- Check the player sword box and confirm M2 stays weapon-neutral.
- Check that attack contains no baked impact and defeat final poses feel compatible with cancellation.
- Record one decision per actor/state: Approve / Revision Requested / Reject.

## Evidence map

- Complete prompts and generator output names: `sources/PROMPTS.md`
- Technical metadata and state timings: `A7-TECHNICAL-MANIFEST.json`
- Per-frame measurements: `diagnostics/frame-metrics.json`
- Full SHA-256 index: `SHA256SUMS.txt`
- Static comparisons: `comparisons/`
- Per-actor sheets and proofs: `player/` and `enemy/`

Stop condition: after human presentation. Do not integrate, enable, alter the catalog, replace static actors, or begin A8.
