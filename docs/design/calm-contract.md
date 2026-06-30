# The Calm Contract

This is the document Foyer must not betray. Every feature is measured against it.

## The reframe

"The phone is the anxiety surface" is *almost* right, and the small correction is the whole product. The phone is not the anxiety surface — a particular **interaction contract** is, and it merely happens to run on the phone. Messaging apps impose that contract; Foyer replaces it *in the same place*.

The dread of picking up the phone decomposes into five properties, none of which is "the glass":

1. **Unboundedness** — the list never ends; there is no "done"; scroll is infinite. The brain cannot file the task as complete, so it stays open.
2. **Interruption** — badges and pings demand attention on the system's schedule, not yours. You did not choose this moment.
3. **Per-item decision cost** — every unread is an open loop requiring a decision: reply, defer, delete. Twelve items is twelve micro-decisions, and each one is expensive for an AuDHD brain.
4. **Opacity** — you cannot tell what matters without opening each item, so the *unopened set itself* carries dread. The dread is proportional to uncertainty, not to content.
5. **Obligation weight** — someone is waiting, and latency reads as social cost. The reply you avoided for three days was not a decision to ignore it; it fell out of awareness entirely.

## The five inversions

Foyer is calm only if it inverts every one:

| Anxiety property | Foyer's inversion |
|------------------|-------------------|
| Unboundedness | **Bounded.** Finite sections, collapsed by default, an explicit "you're caught up" state. |
| Interruption | **Pull-only.** Foyer never emits a notification. You open it on your terms. |
| Per-item decision cost | **Pre-triaged.** The decision is mostly made for you; you confirm, you don't compute. |
| Opacity | **Low-fidelity by design.** A glance dissolves uncertainty; you needn't open each item to know. |
| Obligation weight | **Trusted "Later."** A defer you believe in, so loops close without action now — and a guilt-free *Waiting on you* that surfaces what fell out of awareness. |

## Why phone-first is *correct*, not a compromise

Putting the calm surface on the desktop would make it a *second* place you must remember to visit — calm, but easy to abandon, and absent exactly when overwhelm strikes (away from the desk). Because the anxious surface already lives on the phone, the calm one must replace it *there*, in the same reach-for-the-phone moment, intercepting the dread instead of relocating it.

This is only safe because Foyer obeys the inversions. A phone app that broke even one of them (a badge, a ping, an endless list) would not be a calm surface on the phone — it would be one more anxious one.

## The "Waiting on you" insight

The user's most useful sentence during design was *"I'm not sure what I'm holding off on."* That is the failure mode stated precisely: the open loops are **invisible**. So Foyer's headline section surfaces them — opened-but-never-answered, questions that went quiet, replies ageing — framed as *"here's what's been waiting,"* never *"you forgot these."* Making the invisible backlog visible, without guilt, is the single highest-value thing Foyer does.

## Tripwires (if any of these appear, the contract is broken)

- Foyer emits a system notification.
- The Sill shows a numeric unread count or a red badge.
- A section can grow without bound in a single sitting.
- There is no state that reads as "you're caught up."
- An item demands a decision Foyer could have pre-made.
- "Later" feels like things will be lost, so the user avoids using it.
