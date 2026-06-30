# Intelligence & RAG

Foyer's intelligence is **hybrid and pull-gated**: always-on triage runs locally; richer help only fires when the user taps. Nothing leaves the device unless explicitly pulled.

## Two tiers

### Tier 1 — On-device triage (always on)

A small local model (e.g. a quantised Gemma/Llama class model via `llama.cpp` or MLC) runs continuously over captured items. It is fast, private, cheap, and produces no heat budget worth worrying about. Per item it produces:

- **Bucket** — `waiting-on-you` / `worth-a-look` / `can-wait` / `noise`.
- **Person resolution** — map the sender's handle (number, email, app handle) to a known person, collapsing channels.
- **Gist** — a one-line summary for the glance.
- **Waiting-on-you detection** — heuristics + model: opened-but-never-answered, an unanswered question addressed to the user, a reply ageing past a threshold.

Tier 1 alone is enough to power the Sill and the Foyer screen. The cloud is never required to triage.

### Tier 2 — Cloud depth (on tap only)

When the user opens an item's **deep view**, Foyer calls the **Claude API** with the user's own key for work the small model cannot do well:

- A fuller, well-written summary of a long thread.
- **RAG over local files** — personal notes, prior threads, calendar, contacts — to answer "what's the context / what did we say last time / who is this".
- An optional **draft reply** in the user's voice.

This is the only path by which content can leave the device, and it is gated:

- **Default-deny.** Nothing is sent unless the user taps an item.
- **Scoped allow rules.** The user configures which categories of content (which people, which sources) may be included in a cloud call. Anything outside the allow set is withheld or redacted.
- **Visible.** The deep view makes it explicit that tapping invokes the cloud.

## RAG corpus

Local-first retrieval over user-provided files, indexed on-device:

- Personal notes / journals (the user already keeps markdown archives — e.g. `coherence-chat-exporter` output).
- Prior message threads already in Foyer's SQLite.
- Contacts and calendar (for "who is this" and "are we supposed to meet").

Embeddings and the vector index live on-device. At tap time, the top-k retrieved chunks (subject to allow rules) are sent to Claude alongside the thread to ground the summary/reply.

## Why hybrid (the chosen fork)

- **Fully on-device** was rejected for v-later depth: small-model summaries and RAG are noticeably weaker, and battery/heat from always-on heavy inference is real.
- **Cloud-everything** was rejected as the default: it sends all message text off-device continuously, which the local-first brand and the user's privacy posture reject.
- **Hybrid** keeps the always-on, high-frequency work local and private, and spends cloud quality only on the rare, user-initiated moments where it matters — at trivial cost for one person's volume.

## Implementation notes

- Claude model IDs and API usage: follow the `claude-api` reference; default to the latest capable model for the depth calls.
- Tier 1 model runs in the Rust host (or a sidecar) and writes results back to SQLite as items are captured.
- Tier 2 is a Rust command invoked by the deep-view UI; it assembles thread + allowed RAG context and calls the API.
