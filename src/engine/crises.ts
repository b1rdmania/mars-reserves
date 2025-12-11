import type { GameState } from "./state";
import type { RNG } from "./rng";
import type { SeasonDef } from "./seasons";

export type CrisisId =
  | "influencer_rug_call"
  | "bridge_exploit_rumour"
  | "multisig_discovered"
  | "paid_promo_leak"
  | "vc_dump_threat"
  | "security_thread"
  | "fake_partnership"
  | "dev_mutiny"
  | "exchange_delist"
  | "fork_attack"
  | "backer_investigation"
  | "tvl_exploit";

export interface CrisisOptionOutcome {
  narrative: string;
  apply: (s: GameState) => GameState;
}

export interface CrisisOption {
  id: string;
  label: string;
  resolve: (s: GameState, rng: RNG) => CrisisOptionOutcome;
}

export interface CrisisDef {
  id: CrisisId;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "legendary";
  weight: (s: GameState) => number;
  options: CrisisOption[];
}

export const CRISES: CrisisDef[] = [
  {
    id: "influencer_rug_call",
    name: "Influencer Accuses You of Rugging Live",
    description: "A loud account is dragging your treasury flows in front of 5k listeners.",
    severity: "high",
    weight: (s) => (s.rage + s.heat) / 120,
    options: [
      {
        id: "statement",
        label: "Issue a formal statement",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.6) {
            return {
              narrative: "Statement lands OK. Community chills a bit.",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 15),
                cred: Math.min(100, st.cred + 10),
              }),
            };
          }
          if (roll < 0.85) {
            return {
              narrative: "Regulator notices your statement footnote.",
              apply: (st) => ({
                ...st,
                heat: Math.min(100, st.heat + 15),
                cred: Math.max(0, st.cred - 5),
              }),
            };
          }
          return {
            narrative: "Statement backfires. Meme thread doubles the rage.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 20),
              cred: Math.max(0, st.cred - 10),
            }),
          };
        },
      },
      {
        id: "ignore",
        label: "Ignore",
        resolve: () => ({
          narrative: "You ignore. The mob simmers.",
          apply: (st) => ({
            ...st,
            rage: Math.min(100, st.rage + 10),
            hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.1 },
          }),
        }),
      },
      {
        id: "join_space",
        label: "Join their Space",
        resolve: (s, rng) => {
          const success = rng() < s.cred / 120; // scales with cred
          if (success) {
            return {
              narrative: "You handle it calmly; chat respects the transparency.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 15),
                rage: Math.max(0, st.rage - 10),
              }),
            };
          }
          return {
            narrative: "You get flustered, clips go viral.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 20),
              rage: Math.min(100, st.rage + 25),
              hidden: { ...st.hidden, founderStability: st.hidden.founderStability - 0.2 },
            }),
          };
        },
      },
      {
        id: "blame_contractor",
        label: "Blame a contractor",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.5) {
            return {
              narrative: "Community buys it (for now).",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 5),
                cred: Math.max(0, st.cred - 5),
                hidden: { ...st.hidden, auditRisk: st.hidden.auditRisk + 0.05 },
              }),
            };
          }
          if (roll < 0.75) {
            return {
              narrative: "Contractor leaks DMs. Heat spikes.",
              apply: (st) => ({
                ...st,
                heat: Math.min(100, st.heat + 20),
                cred: Math.max(0, st.cred - 10),
              }),
            };
          }
          return {
            narrative: "Legendary leak: screenshots everywhere.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 30),
              rage: Math.min(100, st.rage + 20),
              hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.2 },
            }),
          };
        },
      },
      {
        id: "pivot_ai",
        label: "Pivot to AI mid-Space",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.4) {
            return {
              narrative: "AI hype distracts everyone briefly.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 20),
                rage: Math.max(0, st.rage - 5),
                heat: Math.min(100, st.heat + 5),
              }),
            };
          }
          return {
            narrative: "People laugh at the pivot. Rage builds.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 15),
              cred: Math.max(0, st.cred - 5),
            }),
          };
        },
      },
    ],
  },
  {
    id: "bridge_exploit_rumour",
    name: "Bridge Exploit Rumour",
    description: "Rumours of a bridge exploit spread. Funds look shaky.",
    severity: "medium",
    weight: (s) => (s.hidden.auditRisk > 0.3 ? 1.2 : 0.3),
    options: [
      {
        id: "pause_bridge",
        label: "Pause the bridge",
        resolve: () => ({
          narrative: "Bridge paused. Users angry but funds safe (maybe).",
          apply: (st) => ({
            ...st,
            heat: Math.min(100, st.heat + 10),
            rage: Math.min(100, st.rage + 5),
            cred: Math.max(0, st.cred - 5),
            hidden: { ...st.hidden, auditRisk: st.hidden.auditRisk - 0.1 },
          }),
        }),
      },
      {
        id: "deny",
        label: "Deny and cope",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.4) {
            return {
              narrative: "Rumour dies down. Crisis averted.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 5),
              }),
            };
          }
          return {
            narrative: "Exploit confirmed. Rage erupts.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 25),
              heat: Math.min(100, st.heat + 15),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "bounty",
        label: "Post a bounty",
        resolve: () => ({
          narrative: "Whitehats engage. Costs treasury but buys time.",
          apply: (st) => ({
            ...st,
            officialTreasury: Math.max(0, st.officialTreasury - 80),
            cred: Math.min(100, st.cred + 5),
            heat: Math.min(100, st.heat + 5),
          }),
        }),
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // NEW DEGEN WEB3-AUTHENTIC CRISES
  // ═══════════════════════════════════════════════════════════

  {
    id: "multisig_discovered",
    name: "CT Discovers Your Multisig Signers",
    description: "Someone notices your multisig is you + your girlfriend + your dog's ENS.",
    severity: "high",
    weight: (s) => (s.hidden.auditRisk > 0.2 ? 1.0 : 0.4),
    options: [
      {
        id: "deny",
        label: "\"That's not my dog\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.3) {
            return {
              narrative: "Against all odds, people get distracted by another scandal.",
              apply: (st) => ({ ...st, rage: Math.min(100, st.rage + 5) }),
            };
          }
          return {
            narrative: "The dog's ENS resolves to your seedphrase backup. Legendary ratio.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 30),
              cred: Math.max(0, st.cred - 25),
              tokenPrice: st.tokenPrice * 0.8,
            }),
          };
        },
      },
      {
        id: "add_signers",
        label: "Add real signers immediately",
        resolve: () => ({
          narrative: "You scramble to add VCs as signers. They're not happy about the optics.",
          apply: (st) => ({
            ...st,
            rage: Math.max(0, st.rage - 10),
            heat: Math.min(100, st.heat + 10),
            cred: Math.max(0, st.cred - 5),
          }),
        }),
      },
      {
        id: "decentralization_theater",
        label: "\"Household decentralisation is the future\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.2) {
            return {
              narrative: "Somehow this becomes a meme in your favor. Degen king energy.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 10),
                techHype: Math.min(100, st.techHype + 15),
              }),
            };
          }
          return {
            narrative: "You're now a governance laughingstock. Thread archives this forever.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 20),
              rage: Math.min(100, st.rage + 15),
            }),
          };
        },
      },
      {
        id: "attack_sleuth",
        label: "Attack the sleuth's credibility",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Sleuth's old tweets surface. Narrative flips briefly.",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 5),
                hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.2 },
              }),
            };
          }
          return {
            narrative: "Sleuth is a based anon with receipts. You look desperate.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 20),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
    ],
  },

  {
    id: "paid_promo_leak",
    name: "Influencer Reveals Paid Promo Screenshots",
    description: "Your $50k/month KOL deal just got exposed with receipts.",
    severity: "high",
    weight: (s) => (s.cred > 50 ? 0.6 : 0.2),
    options: [
      {
        id: "fake",
        label: "\"Those screenshots are photoshopped\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.25) {
            return {
              narrative: "Forensic analysis inconclusive. Doubt lingers but no smoking gun.",
              apply: (st) => ({ ...st, rage: Math.min(100, st.rage + 10) }),
            };
          }
          return {
            narrative: "Payment on-chain. Etherscan don't lie. You're cooked.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 25),
              cred: Math.max(0, st.cred - 30),
              heat: Math.min(100, st.heat + 15),
            }),
          };
        },
      },
      {
        id: "admit",
        label: "\"Yes, and marketing is normal\"",
        resolve: () => ({
          narrative: "Surprisingly, the honesty plays. OGs respect the transparency.",
          apply: (st) => ({
            ...st,
            cred: Math.max(0, st.cred - 10),
            rage: Math.max(0, st.rage - 5),
          }),
        }),
      },
      {
        id: "blame_agency",
        label: "Blame the marketing agency",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Agency takes the fall. Plausible deniability achieved.",
              apply: (st) => ({
                ...st,
                cred: Math.max(0, st.cred - 5),
                officialTreasury: Math.max(0, st.officialTreasury - 50),
              }),
            };
          }
          return {
            narrative: "Agency CEO goes on a podcast about your 'culture'. Nightmare fuel.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 20),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "sue",
        label: "Threaten legal action against leaker",
        resolve: () => ({
          narrative: "Lawyers send letters. CT calls you 'the litigious chain'. Heat rises.",
          apply: (st) => ({
            ...st,
            heat: Math.min(100, st.heat + 20),
            rage: Math.min(100, st.rage + 10),
            officialTreasury: Math.max(0, st.officialTreasury - 100),
          }),
        }),
      },
    ],
  },

  {
    id: "vc_dump_threat",
    name: "VC Threatens to Dump Entire Allocation",
    description: "Lead investor is 'exploring liquidity options' after seeing your Discord.",
    severity: "legendary",
    weight: (s) => (s.rage > 60 || s.cred < 40 ? 0.8 : 0.15),
    options: [
      {
        id: "incentive",
        label: "Offer extended vesting incentive",
        resolve: () => ({
          narrative: "VC accepts new terms. Treasury takes a hit. Crisis deferred.",
          apply: (st) => ({
            ...st,
            officialTreasury: Math.max(0, st.officialTreasury - 200),
            rage: Math.max(0, st.rage - 10),
          }),
        }),
      },
      {
        id: "tokenomics",
        label: "Emergency tokenomics adjustment",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "New emission schedule buys time. Degens confused but hodling.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 5),
                rage: Math.min(100, st.rage + 10),
              }),
            };
          }
          return {
            narrative: "Tokenomics change seen as desperation. Price dumps anyway.",
            apply: (st) => ({
              ...st,
              tokenPrice: st.tokenPrice * 0.75,
              rage: Math.min(100, st.rage + 20),
              cred: Math.max(0, st.cred - 10),
            }),
          };
        },
      },
      {
        id: "emergency_call",
        label: "Host emergency investor call",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.6) {
            return {
              narrative: "Call goes well. VCs placated. For now.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 5),
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "Call recording leaks. 'We're definitely not a security' clip goes viral.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 30),
              rage: Math.min(100, st.rage + 15),
            }),
          };
        },
      },
      {
        id: "attack_vc",
        label: "Subtweet the VC",
        resolve: () => ({
          narrative: "VC dumps everything. Price craters. But your timeline is popping.",
          apply: (st) => ({
            ...st,
            tokenPrice: st.tokenPrice * 0.6,
            tvl: st.tvl * 0.7,
            rage: Math.min(100, st.rage + 30),
            techHype: Math.min(100, st.techHype + 10),
          }),
        }),
      },
    ],
  },

  {
    id: "security_thread",
    name: "\"Is This a Security?\" Thread Goes Viral",
    description: "Law school grad with 47 followers just ended your whole career (maybe).",
    severity: "high",
    weight: (s) => (s.heat > 40 ? 0.7 : 0.25),
    options: [
      {
        id: "lawyer",
        label: "Emergency legal consultation",
        resolve: () => ({
          narrative: "Lawyers advise 'no comment'. You post 'no comment'. Heat rises anyway.",
          apply: (st) => ({
            ...st,
            heat: Math.min(100, st.heat + 15),
            officialTreasury: Math.max(0, st.officialTreasury - 80),
          }),
        }),
      },
      {
        id: "narrative",
        label: "Change token narrative to 'utility'",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "New utility narrative sticks. 'It's for governance!'",
              apply: (st) => ({
                ...st,
                heat: Math.max(0, st.heat - 10),
                cred: Math.max(0, st.cred - 5),
              }),
            };
          }
          return {
            narrative: "SEC intern screenshots your governance page. Zero utility found.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 25),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "ignore_sec",
        label: "Pretend you didn't see it",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Thread dies. Algo buries it. Crisis averted.",
              apply: (st) => ({
                ...st,
                hidden: { ...st.hidden, auditRisk: st.hidden.auditRisk + 0.15 },
              }),
            };
          }
          return {
            narrative: "Thread gets picked up by Bloomberg. Your mentions are on fire.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 35),
              rage: Math.min(100, st.rage + 10),
            }),
          };
        },
      },
      {
        id: "meme",
        label: "Meme through it",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.35) {
            return {
              narrative: "'We're a meme, not a security' becomes legendary. Degen hall of fame.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 20),
                cred: Math.min(100, st.cred + 5),
              }),
            };
          }
          return {
            narrative: "SEC does not find this funny. Subpoena incoming.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 40),
              cred: Math.max(0, st.cred - 20),
            }),
          };
        },
      },
    ],
  },

  {
    id: "fake_partnership",
    name: "Partnership Turns Out Fake (AI Logo)",
    description: "Your 'Fortune 500 partnership' logo was generated by Midjourney. CT noticed.",
    severity: "medium",
    weight: (s) => (s.cred > 40 ? 0.5 : 0.2),
    options: [
      {
        id: "intern",
        label: "\"Intern made a mistake\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.6) {
            return {
              narrative: "Intern takes the fall. Fire them publicly for extra points.",
              apply: (st) => ({
                ...st,
                cred: Math.max(0, st.cred - 10),
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "People find the intern's locked account. They don't exist. Oops.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 25),
              rage: Math.min(100, st.rage + 20),
            }),
          };
        },
      },
      {
        id: "misunderstanding",
        label: "\"It was a miscommunication\"",
        resolve: () => ({
          narrative: "Corporate speak softens the blow. People move on eventually.",
          apply: (st) => ({
            ...st,
            cred: Math.max(0, st.cred - 15),
          }),
        }),
      },
      {
        id: "real_partnership",
        label: "Announce a REAL partnership next turn",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "You actually land a real partner. Redemption arc begins.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 15),
                techHype: Math.min(100, st.techHype + 10),
                tokenPrice: st.tokenPrice * 1.1,
              }),
            };
          }
          return {
            narrative: "No real partner materializes. You're triple-cooked.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 30),
              rage: Math.min(100, st.rage + 25),
            }),
          };
        },
      },
      {
        id: "attack_fud",
        label: "\"This is coordinated FUD\"",
        resolve: () => ({
          narrative: "Conspiracy theories fly. Some believe you. Most don't.",
          apply: (st) => ({
            ...st,
            rage: Math.min(100, st.rage + 15),
            cred: Math.max(0, st.cred - 10),
            techHype: Math.min(100, st.techHype + 5),
          }),
        }),
      },
    ],
  },

  {
    id: "dev_mutiny",
    name: "Dev Team Mutiny",
    description: "Lead dev just posted a 🧵 about 'toxic founder culture'. Three others liked it.",
    severity: "high",
    weight: (s) => (s.hidden.founderStability < 0.6 ? 1.0 : 0.25),
    options: [
      {
        id: "raise_salaries",
        label: "Emergency salary raises",
        resolve: () => ({
          narrative: "Money talks. Devs delete the thread. For now.",
          apply: (st) => ({
            ...st,
            officialTreasury: Math.max(0, st.officialTreasury - 150),
            cred: Math.max(0, st.cred - 5),
            hidden: { ...st.hidden, founderStability: st.hidden.founderStability + 0.1 },
          }),
        }),
      },
      {
        id: "replace",
        label: "Replace the entire team",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.3) {
            return {
              narrative: "New team ships faster. Old team copes on X.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 10),
                cred: Math.max(0, st.cred - 15),
              }),
            };
          }
          return {
            narrative: "New team can't find the repo password. Roadmap delayed 6 months.",
            apply: (st) => ({
              ...st,
              techHype: Math.max(0, st.techHype - 30),
              rage: Math.min(100, st.rage + 20),
              cred: Math.max(0, st.cred - 20),
            }),
          };
        },
      },
      {
        id: "legal_threat",
        label: "Remind them about NDAs",
        resolve: () => ({
          narrative: "Devs go quiet. But the code commits stop too. Suspicious.",
          apply: (st) => ({
            ...st,
            techHype: Math.max(0, st.techHype - 15),
            heat: Math.min(100, st.heat + 10),
          }),
        }),
      },
      {
        id: "roadmap",
        label: "Publish ambitious roadmap",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Roadmap distracts everyone. 'Q3 zkEVM' trends.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 15),
                rage: Math.max(0, st.rage - 10),
              }),
            };
          }
          return {
            narrative: "Lead dev QTs roadmap: 'lol we can't build any of this'. Brutal.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 25),
              rage: Math.min(100, st.rage + 20),
            }),
          };
        },
      },
    ],
  },

  {
    id: "exchange_delist",
    name: "Exchange Threatens Delisting",
    description: "Tier 1 CEX just emailed about 'compliance concerns'. 72 hours to respond.",
    severity: "legendary",
    weight: (s) => (s.heat > 50 ? 0.6 : 0.1),
    options: [
      {
        id: "pivot",
        label: "Immediate governance pivot",
        resolve: () => ({
          narrative: "Emergency decentralization theater. Exchange buys it. For now.",
          apply: (st) => ({
            ...st,
            heat: Math.max(0, st.heat - 20),
            cred: Math.max(0, st.cred - 10),
            techHype: Math.max(0, st.techHype - 5),
          }),
        }),
      },
      {
        id: "upgrade",
        label: "Announce chain upgrade",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Exchange delays decision pending 'technical review'. Time bought.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 10),
              }),
            };
          }
          return {
            narrative: "Exchange isn't fooled. Delisting proceeds. Price craters.",
            apply: (st) => ({
              ...st,
              tokenPrice: st.tokenPrice * 0.5,
              tvl: st.tvl * 0.6,
              rage: Math.min(100, st.rage + 35),
            }),
          };
        },
      },
      {
        id: "airdrop",
        label: "Leak airdrop rumors",
        resolve: () => ({
          narrative: "Airdrop farming begins. Volume spikes. Exchange reconsiders.",
          apply: (st) => ({
            ...st,
            tvl: st.tvl * 1.2,
            tokenPrice: st.tokenPrice * 1.1,
            rage: Math.max(0, st.rage - 15),
          }),
        }),
      },
      {
        id: "attack_cex",
        label: "\"CEXs are the enemy\"",
        resolve: () => ({
          narrative: "Maximal degen energy. DEX volume pumps. CEX delists anyway.",
          apply: (st) => ({
            ...st,
            tokenPrice: st.tokenPrice * 0.7,
            techHype: Math.min(100, st.techHype + 20),
            cred: Math.min(100, st.cred + 5),
          }),
        }),
      },
    ],
  },

  {
    id: "fork_attack",
    name: "Community Fork Appears",
    description: "Some anons forked your code and are calling themselves '[YourChain] Classic'.",
    severity: "medium",
    weight: (s) => (s.rage > 50 ? 0.8 : 0.2),
    options: [
      {
        id: "negotiate",
        label: "Negotiate merger",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Fork absorbed. Their community joins. Narrative: 'decentralization'.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 10),
                rage: Math.max(0, st.rage - 15),
                tvl: st.tvl * 1.1,
              }),
            };
          }
          return {
            narrative: "Negotiations fail. Now two chains competing. Confusion reigns.",
            apply: (st) => ({
              ...st,
              tvl: st.tvl * 0.8,
              rage: Math.min(100, st.rage + 10),
            }),
          };
        },
      },
      {
        id: "trash_fork",
        label: "Trash their code quality",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Devs find bugs in fork. Your chain vindicated.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 15),
                cred: Math.min(100, st.cred + 10),
              }),
            };
          }
          return {
            narrative: "Fork's code is actually cleaner. Embarrassing.",
            apply: (st) => ({
              ...st,
              techHype: Math.max(0, st.techHype - 15),
              cred: Math.max(0, st.cred - 10),
            }),
          };
        },
      },
      {
        id: "incentives",
        label: "Launch loyalty incentives",
        resolve: () => ({
          narrative: "Mercenary liquidity stays. True believers leave for fork.",
          apply: (st) => ({
            ...st,
            officialTreasury: Math.max(0, st.officialTreasury - 100),
            tvl: st.tvl * 0.9,
            rage: Math.max(0, st.rage - 10),
          }),
        }),
      },
      {
        id: "legal_fork",
        label: "Send cease and desist",
        resolve: () => ({
          narrative: "'Open source btw' memes flood your timeline. Not a great look.",
          apply: (st) => ({
            ...st,
            cred: Math.max(0, st.cred - 20),
            rage: Math.min(100, st.rage + 15),
            techHype: Math.max(0, st.techHype - 10),
          }),
        }),
      },
    ],
  },

  {
    id: "backer_investigation",
    name: "Lead Backer Under Criminal Investigation",
    description: "Your VC's face is on CNBC with the word 'FRAUD' underneath.",
    severity: "legendary",
    weight: () => 0.15,
    options: [
      {
        id: "distance",
        label: "Public distancing statement",
        resolve: () => ({
          narrative: "'We barely knew them' plays OK. Old photos still circulating though.",
          apply: (st) => ({
            ...st,
            heat: Math.min(100, st.heat + 15),
            cred: Math.max(0, st.cred - 10),
          }),
        }),
      },
      {
        id: "delete_photos",
        label: "Delete all photos with them",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.3) {
            return {
              narrative: "Photos vanish. Nobody archived. Lucky.",
              apply: (st) => ({ ...st, heat: Math.min(100, st.heat + 10) }),
            };
          }
          return {
            narrative: "Wayback Machine exists. Thread compiling deleted photos. Streisand effect.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 25),
              rage: Math.min(100, st.rage + 15),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "pr_firm",
        label: "Hire crisis PR firm",
        resolve: () => ({
          narrative: "Professionals handle it. Narrative slowly shifts. Expensive though.",
          apply: (st) => ({
            ...st,
            officialTreasury: Math.max(0, st.officialTreasury - 120),
            heat: Math.max(0, st.heat - 15),
            cred: Math.max(0, st.cred - 5),
          }),
        }),
      },
      {
        id: "deny_association",
        label: "\"They were just a small LP\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Cap table was never public. Narrative holds.",
              apply: (st) => ({ ...st, heat: Math.min(100, st.heat + 5) }),
            };
          }
          return {
            narrative: "Leaked term sheet shows they led. You're cooked.",
            apply: (st) => ({
              ...st,
              heat: Math.min(100, st.heat + 30),
              cred: Math.max(0, st.cred - 25),
            }),
          };
        },
      },
    ],
  },

  {
    id: "tvl_exploit",
    name: "🚨 Active Exploit Draining TVL",
    description: "Funds are leaving. Fast. Your Discord is on fire. What do you do?",
    severity: "legendary",
    weight: (s) => (s.hidden.auditRisk > 0.4 ? 1.2 : 0.2),
    options: [
      {
        id: "freeze",
        label: "Freeze all contracts immediately",
        resolve: () => ({
          narrative: "Contracts frozen. $47M saved. $23M gone. Could be worse.",
          apply: (st) => ({
            ...st,
            tvl: st.tvl * 0.7,
            tokenPrice: st.tokenPrice * 0.6,
            rage: Math.min(100, st.rage + 30),
            heat: Math.min(100, st.heat + 20),
            cred: Math.max(0, st.cred - 20),
          }),
        }),
      },
      {
        id: "negotiate_hacker",
        label: "Negotiate with the hacker",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Hacker returns 90% for 'bounty'. Legendary outcome actually.",
              apply: (st) => ({
                ...st,
                tvl: st.tvl * 0.9,
                tokenPrice: st.tokenPrice * 0.85,
                cred: Math.min(100, st.cred + 5),
              }),
            };
          }
          return {
            narrative: "Hacker ghosts you after moving to Tornado. Everything gone.",
            apply: (st) => ({
              ...st,
              tvl: st.tvl * 0.3,
              tokenPrice: st.tokenPrice * 0.4,
              rage: Math.min(100, st.rage + 50),
              cred: Math.max(0, st.cred - 40),
            }),
          };
        },
      },
      {
        id: "blame_audit",
        label: "Blame the auditor",
        resolve: () => ({
          narrative: "Auditor's reputation tanks. Yours does too. But less.",
          apply: (st) => ({
            ...st,
            tvl: st.tvl * 0.6,
            tokenPrice: st.tokenPrice * 0.7,
            cred: Math.max(0, st.cred - 15),
            rage: Math.min(100, st.rage + 25),
          }),
        }),
      },
      {
        id: "tweet_calmly",
        label: "\"Funds are SAFU\" tweet",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.2) {
            return {
              narrative: "Somehow true. Attacker's TX reverted. Miracle.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 20),
                techHype: Math.min(100, st.techHype + 10),
              }),
            };
          }
          return {
            narrative: "Funds were not SAFU. Screenshot immortalized forever.",
            apply: (st) => ({
              ...st,
              tvl: st.tvl * 0.4,
              tokenPrice: st.tokenPrice * 0.5,
              rage: Math.min(100, st.rage + 40),
              cred: Math.max(0, st.cred - 35),
            }),
          };
        },
      },
    ],
  },
];

export function maybePickCrisis(state: GameState, rng: RNG, season: SeasonDef): CrisisDef | null {
  const base =
    0.05 +
    state.rage * 0.001 +
    state.heat * 0.001 +
    (100 - state.cred) * 0.0005 +
    state.hidden.auditRisk * 0.2;
  const seasonFactor = season.crisisFactor ?? 1;
  const adjusted = base * seasonFactor;
  if (rng() > adjusted) return null;

  const candidates = CRISES.filter((c) => c.weight(state) > 0);
  if (!candidates.length) return null;
  const weights = candidates.map((c) => c.weight(state));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export interface CrisisResolution {
  state: GameState;
  narrative: string;
}

export function resolveCrisisOption(state: GameState, optionId: string, rng: RNG): CrisisResolution {
  if (!state.pendingCrisis) return { state, narrative: "" };
  const option = state.pendingCrisis.options.find((o) => o.id === optionId);
  if (!option) return { state, narrative: "" };
  const outcome = option.resolve(state, rng);
  const updated = outcome.apply(state);
  return {
    state: {
      ...updated,
      pendingCrisis: undefined,
      log: [`[CRISIS] ${outcome.narrative}`, ...updated.log],
    },
    narrative: outcome.narrative,
  };
}

