# Design QA — Personalized “Now” Bento

## Scope

The homepage is a project-focused adaptation of the Now reference. The latest refinement promotes the Bosphorus sunset to a wide row, places compact PlakaTR and HolyHub cards beside each other, overscans HolyHub’s Prayer Sky video beyond every card edge, and adds five gold stars directly above the recent-watch title. Earlier refinements centered the header, adopted the reference’s dark palette, replaced ProShot with Gökhan’s wide car photo, added the Istanbul globe, added hover music playback, added source-like photo lightboxes, and hardened every card video so it restarts before its last frame can remain blank.

## Source visual truth

- Reference: `https://now.framer.website/`
- Globe study: `https://codepen.io/410gone/pen/jvMJMd`
- Talent Clerk source: `/Users/gok/Downloads/howitworks.mp4`
- Imposto source: `/Users/gok/Downloads/Imposter Game Imposto - Spy (Latest iOS Version).mp4`
- SyncDrive source: `/Users/gok/Downloads/SyncDrive - UGC Videos For TikTok/Girl Shocked - Can't believe my reflex is this bad.mp4`
- HolyHub source: `/Applications/ServBay/www/hh` and `https://holy-hub.com/`
- Project Hail Mary: supplied YouTube video `eeKFto-WBYk`
- Song: supplied YouTube Music video `t1_N1GpW9P4`

## Local media output

- `images/now/videos/talent-clerk.mp4` — H.264, 640×392, 74.4 seconds
- `images/now/videos/imposto.mp4` — H.264, 404×720, 12.0 seconds
- `images/now/videos/syncdrive.mp4` — H.264, 404×720, 21.9 seconds
- `images/now/videos/holy-hub-prayer-sky-dark.mp4` — H.264, 1280×720, 9.34 seconds
- `images/now/holy-hub-icon.webp` — locally optimized authentic dark iOS app icon
- `images/now/creaffin-footer-bg.png` — local Creaffin artwork
- `images/now/photo-7273.webp`, `photo-7521.webp`, and `photo-9128.webp` — locally converted personal photos
- `images/now/song-lady-hear-me-tonight.jpg` — local song artwork

## Final layout map

Desktop uses four columns, five 200px rows, 16px gaps, and a centered 848px maximum grid:

```text
bio          contact       talent        talent
location     creaffin      talent        talent
imposto      syncdrive     car photo     car photo
sunset       sunset        plakatr       holyhub
cat photo    music         watch         watch
```

Mobile uses two columns, 12px gaps, and a 540px maximum grid:

```text
bio          contact
talent       talent
location     creaffin
imposto      syncdrive
car photo    car photo
sunset       sunset
plakatr      holyhub
cat photo    music
watch        watch
```

## Final rendered evidence

- Desktop reordered grid and live media: `qa/implementation-final-desktop.jpg`
- Mobile Location/Creaffin, video, and promoted car-photo rows: `qa/implementation-final-mobile.jpg`
- Mobile PlakaTR, photo, music, and recent-watch rows: `qa/implementation-final-mobile-lower.jpg`
- Mobile source-like photo viewer: `qa/implementation-final-lightbox.jpg`
- Centered dark header at 1280×720: `qa/implementation-dark-header-desktop.jpg`
- Centered dark header at 390×844: `qa/implementation-dark-header-mobile.jpg`

## Fidelity review

| Surface | Result |
| --- | --- |
| Grid rhythm | The 200/200/416 composition remains source-like. The sunset is now a wide photo row; PlakaTR and HolyHub are compact adjacent project cards. |
| Location | The card has a locally generated dotted Braille globe in its lower-right corner. It rotates at a restrained frame rate and becomes static under reduced motion. |
| Music | Pointer hover starts playback on non-touch devices, leaving the card pauses it, and the explicit play/pause control remains available. The circular artwork rotates only while playing. |
| Photo viewer | All three personal photos are keyboard-accessible buttons. Activation opens the authentic image in a dim full-screen viewer; Escape or backdrop activation closes it and returns focus. |
| Video cards | Talent Clerk, Imposto, SyncDrive, and HolyHub use local muted looping videos. Near-end and ended recovery prevent a blank final frame. Project Hail Mary also replays after a YouTube ended event. |
| Recent watch | Five compact gold stars sit directly above the Project Hail Mary title, following the reference card’s star-first hierarchy. |
| Visual tokens | Local Inter/Inter Display/Geist Mono fonts, `#090909` canvas, `#171717` cards, 24px radii, subtle light-edge shadows, and 16/12px gaps now follow the reference’s dark system. |

## Comparison and iteration history

| Iteration | Finding | Severity | Resolution and post-fix evidence |
| --- | --- | --- | --- |
| Initial media grid | ProShot remained in the wide project slot and PlakaTR preceded Location. | P2 | Removed ProShot, promoted `photo-7273.webp` to the wide slot, and swapped Location/PlakaTR positions. |
| First globe pass | The original icon did not provide the requested reference-like motion. | P2 | Replaced it with a local procedural Braille globe inspired by the supplied CodePen; no external runtime dependency was added. |
| Music interaction | Playback was button-only and the artwork stayed still. | P2 | Added hover play/pause, synchronized control state, and a playing-state artwork rotation with reduced-motion support. |
| Photo cards | Images had no expanded viewing state. | P2 | Added an accessible full-screen lightbox matching the reference’s dark backdrop, rounded centered image, and backdrop/Escape dismissal. |
| Video end boundary | Native loop could briefly expose the last blank frame on some files. | P1 | Rewind 0.35 seconds before the end, retain native `loop`, and recover from `ended`. Forced end-boundary testing returned every video to active playback near time zero. |
| Header and theme | The personalized header was left-aligned on a light canvas, unlike the centered dark reference. | P2 | Centered the clock, two-line name/avatar, and social segment; switched canvas/cards/icons/muted text/tooltips/focus styling to a contrast-safe dark palette. Desktop and mobile centers resolve exactly to the viewport midpoint. |
| PlakaTR/HolyHub row | The sunset and PlakaTR each occupied a wide region, leaving no compact project slot for HolyHub. | P2 | Promoted the sunset to the left-wide region and divided the right half into adjacent PlakaTR and HolyHub cards. HolyHub uses the authentic app icon and local dark Prayer Sky video. |
| HolyHub/watch polish | HolyHub’s native frame could expose an edge at some crops, and the recent-watch title lacked the reference’s star cue. | P2 | Overscanned the video to 110%+ of the card in both axes and added five stars immediately before the title. Computed geometry confirms full coverage at 1280px and 390px. |
| Final responsive pass | No actionable crop, spacing, hierarchy, focus, overflow, or console issue remained. | Pass | Verified at 1280×720, 390×844, 320×800, and both sides of the 809/810px breakpoint. |

## Functional verification

| Check | Result |
| --- | --- |
| Card count and order | 14 cards render in the final requested order; ProShot count is zero and HolyHub count is one. |
| Copy and links | Bio reads “vibe coder, based in Istanbul, Türkiye.” X targets `https://x.com/gokhanpw`; LinkedIn count is zero. |
| Local looping videos | Talent Clerk, Imposto, SyncDrive, and HolyHub report `readyState: 4`, `loop: true`, and active playback while visible. HolyHub’s forced seek to `duration − 0.2` returned to 1.21 seconds with playback active and no media error. |
| Hail Mary background | The iframe includes YouTube loop/playlist parameters and receives `playVideo` again when the player reports its ended state. |
| Music hover | Pointer enter loads and plays the YouTube Music embed, sets `aria-pressed="true"`, and starts the disc animation; pointer leave pauses and restores the play state. |
| Photo lightbox | Click/keyboard open, Escape close, backdrop close, scroll lock, authentic source dimensions, and focus return all pass on desktop and mobile. |
| Reduced motion | Entrance effects, disc rotation, and globe animation become static; autoplay media remains suppressed by the existing motion preference handling. |
| Clipboard | `hi@gokhan.pw` copy, fallback, accessible announcement, and reset behavior remain intact. |
| Desktop geometry | 1280px renders a 416px sunset beside 200px PlakaTR/HolyHub cards with no horizontal overflow. The clock, name block, and social segment share the 640px viewport center. |
| Mobile geometry | 390px renders a 358px sunset followed by adjacent 173px PlakaTR/HolyHub cards, with no overflow or email truncation. |
| Breakpoint edge | 809px renders two 264px columns; 810px renders four 182.5px columns. Neither state overflows. |
| Assets and console | Local images/videos/fonts load and browser console logs are empty. |
| Syntax and whitespace | `node --check js/now.js` and `git diff --check` pass. |

## Final verdict

The final homepage preserves the reference’s compact bento rhythm while making the content more personal and interactive. The wide sunset and adjacent PlakaTR/HolyHub project row, authentic Prayer Sky media, globe, hover music, photo viewer, and resilient looping behavior all pass desktop, mobile, keyboard, and reduced-motion checks.

final result: passed
