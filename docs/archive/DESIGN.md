# Move: Mars Reserves  
## Design Manifesto & Decision Framework

### One-line Pitch
*A short, replayable idle-strategy game about ambition, scarcity, and legacy on Mars — where every run becomes part of a permanent historical record.*

---

## Core Design Goal

**Build a Game Boy–era style idle strategy game where:**
- decisions feel simple
- consequences are delayed
- outcomes are irreversible
- history matters more than optimisation

This is not a simulator.  
This is not a dashboard.  
This is a **verdict machine**.

---

## Primary Influences

- **Game Boy / GBA strategy games**
  - Advance Wars
  - SimCity 2000
  - FTL (spiritually)
- **Short-session idle games**
  - Simple inputs, long consequences
- **Narrative strategy**
  - Papers, Please
  - This War of Mine
- **Hard sci-fi tone**
  - Arthur C. Clarke
  - Institutional tension over spectacle

---

## What This Game Is NOT

- Not a resource micromanager
- Not a simulation of real Mars logistics
- Not a crypto game with Mars skin
- Not a long-form live service

If a design change adds:
- more currencies
- more dashboards
- more optimisation
- more explanations

…it is probably wrong.

---

## Core Player Fantasy

>You are the commander of humanity's first permanent Mars colony.  
>You are meant to protect it.  
>You also want to be remembered.

Every decision lives in that tension.

---

## Core Gameplay Loop

1. **Start a mission**
2. **Make one decision per cycle**
3. **Watch delayed consequences accumulate**
4. **Survive 10 cycles or fail**
5. **Receive a historical verdict**
6. **Choose whether to record that history**
7. **Try again**

Replayability comes from *moral pressure*, not mechanical depth.

---

## Design Pillars

### 1. One Resource, With Texture
We use **one shared survival resource**, not many.

- **Colony Stockpile** represents:
  - energy
  - materials
  - oxygen margin
  - logistics slack

We do NOT track oxygen directly.  
We track how close you are to *not having oxygen*.

> One resource = fear  
> Many resources = maths

---

### 2. Legacy Is Seductive, Survival Is Heavy

- **Legacy Capital**
  - personal
  - aspirational
  - visually rewarded
- **Colony Stockpile**
  - collective
  - utilitarian
  - visually restrained

The UI must always make Legacy feel *tempting* and Stockpile feel *finite*.

---

### 3. Delayed Consequences Beat Immediate Feedback

Good decisions don't feel good immediately.  
Bad decisions often don't hurt right away.

We favour:
- hidden state
- memory
- scrutiny
- compounding risk

Over:
- instant punishment
- clear optimisation paths

---

### 4. Fewer Stats, Sharper Meaning

Displayed stats must be explainable in one sentence:

- **Legacy Capital** — what history credits to you
- **Colony Stockpile** — how long people keep breathing
- **Unrest** — how close the crew is to acting
- **Oversight** — how closely Earth is watching
- **Trust** — whether orders are followed
- **Momentum** — whether progress narratives are believable

If a stat needs a paragraph, it should not be on the HUD.

---

### 5. End Screens Are Verdicts, Not Summaries

An ending screen should do **two things only**:
1. Deliver the emotional outcome
2. Ask one meaningful question

That question is:
> *Do you want this recorded?*

All analysis, breakdowns, and sharing live **after** that choice.

---

## Tone & Writing Rules

- Institutional, not meme-y
- Dry, not jokey
- Ironic, not sarcastic
- Historical, not social-media-coded

Avoid:
- "viral"
- "DMs"
- "ratio"
- "pump/dump"
- "lol"

Prefer:
- "circulated"
- "formally recorded"
- "archived"
- "reviewed"
- "noted"

---

## Why Blockchain Exists Here

Blockchain is **not** the game.

It is the **archive**.

- Each run is a discrete historical record
- Recording is optional
- Recording is irreversible
- Recording is framed as acceptance, not reward

If a feature makes blockchain feel:
- gamified
- transactional
- required to play

…it is likely wrong.

---

## UX Principles

- Fewer buttons > more buttons
- One primary action per screen
- Silence is allowed
- Negative space is intentional
- Danger should be felt before it is explained

If the UI looks "clean but boring", add *implication*, not *information*.

---

## Hackathon Constraints (Explicit)

Given time constraints:
- We prefer semantic fixes over mechanical rewrites
- We hide complexity instead of deleting it
- We optimise for **first impression clarity**
- We design for a **3-minute demo**

This document is the guardrail for all tradeoffs.

---

## Final Test (Use This Before Merging Anything)

Ask:
> Does this change make the player feel more pressure, more temptation, or more finality?

If the answer is no — don't ship it.

---

## Summary

**Move: Mars Reserves** is a small game about big mistakes.

It should feel:
- restrained
- tense
- quietly cruel
- worth replaying

Not because it is complex —  
but because history is watching.
