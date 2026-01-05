# Mars Extraction

> A public mission. A private legacy.

**Mars Extraction** is a Web 2.5 strategy game built on Movement blockchain. Every decision you make — every compromise, every shortcut — is recorded permanently on-chain. Your choices don't just affect your score. They become data that shapes how the game evolves.

## 🎮 Play Now

**[marsreserves.xyz](https://marsreserves.xyz)**

---

## ⛓️ Why Movement?

Most blockchain games are either Unity ports with a wallet bolted on, or they're slow and clunky with endless transaction approvals.

Mars Extraction is different:

- **Fully abstracted**: Privy handles auth, Shinami sponsors gas — players never see a wallet prompt
- **On-chain decisions**: Every completed run is recorded to Movement with a verifiable hash
- **Speed matters**: Movement's performance makes real-time recording viable
- **Data with purpose**: On-chain decision data will shape future game mechanics

**Your choices become permanent. The archive is alive.**

---

## 🌌 The Game

You are the commander of Olympus Base. Guide the colony through 10 cycles while balancing survival against your own ambitions.

- **One resource, infinite pressure**: Colony Stockpile represents everything — energy, oxygen, materials
- **Legacy is seductive**: Extract resources for personal glory, but the crew is watching
- **Delayed consequences**: Bad decisions don't hurt immediately... until they do
- **30 unique endings**: From legendary triumph to catastrophic failure

---

## 🏗️ Built With

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + TypeScript |
| **Auth** | Privy (wallet login, embedded wallets) |
| **Backend** | Supabase (profiles, runs, leaderboards) |
| **Blockchain** | Movement Network (Bardock Testnet) |
| **Gas Sponsorship** | Shinami Gas Station |

---

## 📜 On-Chain Recording

The `mission_index` Move contract records verified game runs:

```move
public entry fun record_mission(
    run_hash: vector<u8>,
    score: u64,
    ending_id: vector<u8>,
)
```

Each run is verified server-side before recording. All transactions are sponsored — **players never pay gas**.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## 📋 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_PRIVY_APP_ID` | Privy application ID |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key |
| `SHINAMI_API_KEY` | Shinami Gas Station key |
| `MISSION_INDEX_ADDRESS` | Deployed contract address |

---

## 🏆 Movement Hackathon 2026

Built for the Movement Network Hackathon. Categories:
- **Best Gaming App on Movement**
- **Best App Using Privy Wallets**
- **The People's Choice**

---

*A game about big mistakes in a small colony.*
