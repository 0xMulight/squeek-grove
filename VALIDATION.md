# Validation · v2.0 · 2026-11-05

## Automated checks

All application, engine, order-view and artwork modules pass JavaScript syntax checks. All **23** regression tests pass via `npm run check`.

Covered: precise planting costs, inventory and sales, repeated-action rejection, watering limits, targeted irrigation and wheel-grown quality, order deadlines, exact atomic stock deductions, standard-order quality fallback, wheel-only requirements, cancellation/expiry preserving stock and plants, stale confirmation IDs, legacy-save migration without duplicate inventory, malformed saves, fresh hardware provenance, counter continuity/epoch resets, energy carry/caps and absent settled-height metadata. All standard orders were verified as feasible on three plots without wheel energy.

## Browser checks in this release

- From a fresh game, planted a carrot, watered growing crops and accepted the Picnic order through its confirmation screen.
- Harvested two carrots and a daisy into inventory: coins stayed at 34. Reviewed the exact stock deduction and delivered once: coins became 110, inventory was consumed, level increased and history recorded the delivery.
- Grew and sold a spare carrot: stock decreased by one and coins increased by the displayed 14.
- Opened a wheel-delivery confirmation showing the missing 12 energy at a zero-energy balance; accepted then cancelled it. Growing plants and game coins remained.
- Claimed the new first-delivery goal, selected the mushroom decoration, and refreshed. Coins, level, plants, decoration and progression remained.
- Confirmed all five garden goals are visible, including the new delivery reward.
- Inspected Chinese and English interfaces at a 390-pixel iframe width. The usable 375-pixel layout had equal client and scroll widths in both garden and order screens. Order cards, controls and modal bounds fit the viewport.
- Exported a JSON save from the browser, then parsed and validated the downloaded v2 state, including its active order and completed-delivery count.
- The public API connected and reported hardware provenance with an inactive wheel during manual checks. Positive hardware-work collection, stored-energy irrigation and charged deliveries were verified in deterministic engine tests; a positive live event was not manually observed or fabricated.
- Captured the actual garden and order views in `docs/garden-preview.jpg` and `docs/orders-preview.jpg`.

## Existing functionality and limits

The unchanged postcard exporter had previously produced a verified 2000 × 1320 PNG in v1; the earlier example remains `docs/garden-postcard.png`. The original art, seed journal, local backup UI and decoration system are retained. Legacy migration is tested with a v1 fixture; this browser session began with a fresh game rather than a pre-existing v1 localStorage key.

GitHub Pages workflow is included using the current official static-site actions. It has not been run in the user's GitHub account. The release is deployed to the existing owner-private preview; public GitHub publication, custom-domain configuration, official ownership verification and Squeekchain submission remain user steps. No official acceptance or reward eligibility is claimed.
