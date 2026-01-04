# Mars Extraction

> A public mission. A private legacy.

**Mars Extraction** is a short-session strategy game about leading humanity's first permanent Mars colony. Every decision carries weight — and every run becomes part of a permanent historical record on the Movement blockchain.

## 🎮 Play Now

**[mars-extraction.vercel.app](https://mars-extraction.vercel.app)**

## 🌌 The Game

You are the commander of Olympus Base. Your mission: guide the colony through 20 cycles while balancing survival against your own ambitions.

- **One resource, infinite pressure**: Colony Stockpile represents everything — energy, oxygen, materials
- **Legacy is seductive**: Extract resources for personal glory, but the crew is watching
- **Delayed consequences**: Bad decisions don't hurt immediately... until they do
- **Permanent records**: Every completed mission can be recorded on-chain via Movement

## 🏗️ Built With

- **Frontend**: React + Vite + TypeScript
- **Auth**: Privy (email, social, or wallet login)
- **Backend**: Supabase (profiles, runs, leaderboards)
- **Blockchain**: Movement Network (Bardock Testnet)
- **Gas Sponsorship**: Shinami Gas Station (free on-chain recording)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_PRIVY_APP_ID` | Privy application ID | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (API) | Yes |
| `SHINAMI_API_KEY` | Shinami Gas Station key | For on-chain |
| `MISSION_INDEX_ADDRESS` | Deployed contract address | For on-chain |
| `ENABLE_ONCHAIN` | Enable blockchain recording | Optional |

## 🎯 Design Philosophy

This game is intentionally restrained:
- **Fewer buttons** over more options
- **Silence is allowed** — not every moment needs feedback  
- **Danger should be felt** before it's explained
- **History matters** more than optimisation

Read the full [DESIGN.md](./DESIGN.md) for the complete design manifesto.

## 📜 Smart Contract

The `mission_index` Move contract records verified game runs on Movement:

```move
public entry fun record_mission(
    run_hash: vector<u8>,
    score: u64,
    ending_id: vector<u8>,
)
```

All on-chain transactions are sponsored via Shinami — players never pay gas.

## 🏆 Hackathon

Built for **Movement Network Hackathon 2026**.

---

*A game about big mistakes in a small colony.*
