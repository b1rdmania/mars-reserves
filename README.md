# Mars Extraction

**A public mission. A private legacy.**

**Mars Extraction** is a Web 2.5 survival strategy game built for the [Movement Network](https://movementnetwork.xyz/). Set in the first permanent human colony on Mars, players act as the Colony Commander, balancing the utilitarian needs of survival against the seductive pull of personal ambition.

Every run is a historical record. Every decision is permanent.

[**→ Play the Live Demo**](https://marsreserves.xyz)

---

## ⛓️ Built on Movement

Mars Extraction leverages the speed and security of the **Movement Network (Bardock Testnet)** to create a "verdict machine" where blockchain is the immutable archive.

- **Fully Abstracted Web3**: Powered by **Privy**, players experience the benefits of true ownership and verifiable history without the friction of manual wallet management or gas fees.
- **Sponsored On-Chain Events**: Using **Shinami Gas Station**, every completed mission is recorded on-chain with zero cost to the player.
- **Move Smart Contracts**: A custom Move contract on Movement Bardock maintains a tamper-proof Mission Registry, storing run hashes and legacy scores.

---

## 🎮 The Experience

- **Deterministic Strategy**: Navigate a 10-cycle mission where 49 unique actions create a branching path of survival and institutional power.
- **Moral Tension**: Balance **Colony Stockpile** (oxygen, energy, water) against **Legacy Capital** (personal fame and historical credit).
- **Delayed Consequences**: A hidden state engine tracks **Oversight Scrutiny**, **Crew Unrest**, and **Institutional Memory**. Your shortcuts in Cycle 2 will haunt you in Cycle 9.
- **Procedural Verdicts**: 5 distinct ending archetypes based on your command style—from *The Vizier* to *The Martyr*.

[**→ Launch Mission**](https://marsreserves.xyz)

---

## 🎵 Bonus: Wario Synth Sound Engine

As part of this hackathon, I also built **[Wario Synth](https://www.wario.style/)** — a browser-based MIDI-to-Web Audio synthesizer that powers the game's background music. While not directly submitted as part of the Mars Extraction project, it was created during this hackathon to solve the challenge of dynamic, retro-styled game audio.

![Wario Synth Screenshot](./public/wario-synth-screenshot.png)

- **Live Demo**: [wario.style](https://www.wario.style/)
- **Source Code**: [github.com/b1rdmania/motif](https://github.com/b1rdmania/motif)

The engine converts MIDI files into Web Audio API oscillators, creating a nostalgic, Game Boy-inspired soundscape perfect for Mars Extraction's terminal aesthetic.

---

## 🛠️ Technical Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS with a bespoke "Glass-Terminal" aesthetic
- **Auth**: Privy (Embedded Wallets + Social Login)
- **Engine**: Custom TypeScript state machine (Mulberry32 RNG)
- **Database**: Supabase (Persistent career profiles & global archive)
- **Blockchain**: Movement Network (Move Language)
- **Infrastructure**: Shinami (Sui/Aptos Gas Station)

---

## 📜 On-Chain Contract

The `mission_index` contract on Movement Bardock provides a verifiable registry for all missions launched from [**marsreserves.xyz**](https://marsreserves.xyz):


```move
public entry fun record_mission(
    run_hash: vector<u8>,
    score: u64,
    ending_id: vector<u8>,
)
```

**Contract Address:** `0xb35e9866a6c83bb290245cfbb48ef85a32e3b84447150138b37a7f11b9c473cf`

---

## 🏆 Movement Hackathon 2026 Submission

Built by **[b1rdmania](https://x.com/b1rdmania)**.
Live at: [**marsreserves.xyz**](https://marsreserves.xyz)

*A game about big mistakes in a small colony.*
