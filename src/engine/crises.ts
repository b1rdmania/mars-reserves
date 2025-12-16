import type { GameState } from "./state";
import type { RNG } from "./rng";
import type { SeasonDef } from "./seasons";

export type CrisisId =
  | "crew_accusation"
  | "system_failure_rumor"
  | "oversight_discovery"
  | "promotion_leak"
  | "earth_investor_threat"
  | "legal_memo"
  | "fake_breakthrough"
  | "engineering_mutiny"
  | "earth_recall_threat"
  | "rival_colony"
  | "investigation_notice"
  | "infrastructure_sabotage";

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
    id: "crew_accusation",
    name: "Crew Member Accuses You of Mismanagement Live",
    description: "A senior officer is broadcasting claims about resource allocation in front of the whole colony.",
    severity: "high",
    weight: (s) => (s.rage + s.oversightPressure) / 120,
    options: [
      {
        id: "statement",
        label: "Issue a formal statement",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.6) {
            return {
              narrative: "Statement lands OK. Crew calms down a bit.",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 15),
                cred: Math.min(100, st.cred + 10),
              }),
            };
          }
          if (roll < 0.85) {
            return {
              narrative: "Earth oversight notices your statement footnote.",
              apply: (st) => ({
                ...st,
                oversightPressure: Math.min(100, st.oversightPressure + 15),
                cred: Math.max(0, st.cred - 5),
              }),
            };
          }
          return {
            narrative: "Statement backfires. Crew shares it as evidence of deflection.",
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
          narrative: "You ignore. The crew simmers.",
          apply: (st) => ({
            ...st,
            rage: Math.min(100, st.rage + 10),
            hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.1 },
          }),
        }),
      },
      {
        id: "join_meeting",
        label: "Join their assembly",
        resolve: (s, rng) => {
          const success = rng() < s.cred / 120;
          if (success) {
            return {
              narrative: "You handle it calmly; crew respects the transparency.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 15),
                rage: Math.max(0, st.rage - 10),
              }),
            };
          }
          return {
            narrative: "You get flustered, recordings spread across the colony.",
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
        id: "blame_subordinate",
        label: "Blame a subordinate",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.5) {
            return {
              narrative: "Crew buys it (for now).",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 5),
                cred: Math.max(0, st.cred - 5),
                hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny + 0.05 },
              }),
            };
          }
          if (roll < 0.75) {
            return {
              narrative: "Subordinate leaks your private messages. Oversight spikes.",
              apply: (st) => ({
                ...st,
                oversightPressure: Math.min(100, st.oversightPressure + 20),
                cred: Math.max(0, st.cred - 10),
              }),
            };
          }
          return {
            narrative: "Damaging leak: the transcript circulates widely.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 30),
              rage: Math.min(100, st.rage + 20),
              hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.2 },
            }),
          };
        },
      },
      {
        id: "pivot_research",
        label: "Pivot to research announcement",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.4) {
            return {
              narrative: "Research news distracts everyone briefly.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 20),
                rage: Math.max(0, st.rage - 5),
                oversightPressure: Math.min(100, st.oversightPressure + 5),
              }),
            };
          }
          return {
            narrative: "Crew laughs at the obvious deflection. Unrest builds.",
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
    id: "system_failure_rumor",
    name: "Life Support Failure Rumors",
    description: "Rumors of a critical system vulnerability spread. Colony morale shakes.",
    severity: "medium",
    weight: (s) => (s.hidden.scrutiny > 0.3 ? 1.2 : 0.3),
    options: [
      {
        id: "shutdown",
        label: "Initiate system shutdown for inspection",
        resolve: () => ({
          narrative: "Systems paused. Crew angry but feeling safer (maybe).",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 10),
            rage: Math.min(100, st.rage + 5),
            cred: Math.max(0, st.cred - 5),
            hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny - 0.1 },
          }),
        }),
      },
      {
        id: "deny",
        label: "Deny and maintain normal operations",
        resolve: (s, rng) => {
          void s;
          const roll = rng();
          if (roll < 0.4) {
            return {
              narrative: "Rumor dies down. Crisis averted.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 5),
              }),
            };
          }
          return {
            narrative: "System failure confirmed. Crew erupts.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 25),
              oversightPressure: Math.min(100, st.oversightPressure + 15),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "bounty",
        label: "Offer reward for finding the issue",
        resolve: () => ({
          narrative: "Engineers engage. Costs reserves but buys time.",
          apply: (st) => ({
            ...st,
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.01)),
            cred: Math.min(100, st.cred + 5),
            oversightPressure: Math.min(100, st.oversightPressure + 5),
          }),
        }),
      },
    ],
  },

  {
    id: "oversight_discovery",
    name: "Earth Discovers Your Command Structure",
    description: "Oversight notices all key decisions go through you and your handpicked lieutenants.",
    severity: "high",
    weight: (s) => (s.hidden.scrutiny > 0.2 ? 1.0 : 0.4),
    options: [
      {
        id: "deny",
        label: "\"That's standard procedure\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.3) {
            return {
              narrative: "Against all odds, Earth gets distracted by another colony's scandal.",
              apply: (st) => ({ ...st, rage: Math.min(100, st.rage + 5) }),
            };
          }
          return {
            narrative: "Your org chart circulates in oversight circles. The tone hardens.",
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
        id: "add_oversight",
        label: "Add independent oversight immediately",
        resolve: () => ({
          narrative: "You scramble to add Earth-approved observers. They're not happy about the optics.",
          apply: (st) => ({
            ...st,
            rage: Math.max(0, st.rage - 10),
            oversightPressure: Math.min(100, st.oversightPressure + 10),
            cred: Math.max(0, st.cred - 5),
          }),
        }),
      },
      {
        id: "decentralization_theater",
        label: "\"Distributed command is the future of space exploration\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.2) {
            return {
              narrative: "Somehow this plays well. Pioneer credibility rises.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 10),
                techHype: Math.min(100, st.techHype + 15),
              }),
            };
          }
          return {
            narrative: "You're now a governance laughingstock. Earth archives this forever.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 20),
              rage: Math.min(100, st.rage + 15),
            }),
          };
        },
      },
      {
        id: "attack_analyst",
        label: "Attack the analyst's credibility",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Analyst's old reports surface with errors. Narrative flips briefly.",
              apply: (st) => ({
                ...st,
                rage: Math.max(0, st.rage - 5),
                hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.2 },
              }),
            };
          }
          return {
            narrative: "Analyst is respected with receipts. You look desperate.",
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
    id: "promotion_leak",
    name: "Favorable Coverage Deal Exposed",
    description: "Your arrangement with Earth media just got exposed with receipts.",
    severity: "high",
    weight: (s) => (s.cred > 50 ? 0.6 : 0.2),
    options: [
      {
        id: "fake",
        label: "\"Those documents are fabricated\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.25) {
            return {
              narrative: "Forensic analysis inconclusive. Doubt lingers but no smoking gun.",
              apply: (st) => ({ ...st, rage: Math.min(100, st.rage + 10) }),
            };
          }
          return {
            narrative: "Payment records surface. Transaction logs don't lie. You're cooked.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 25),
              cred: Math.max(0, st.cred - 30),
              oversightPressure: Math.min(100, st.oversightPressure + 15),
            }),
          };
        },
      },
      {
        id: "admit",
        label: "\"Yes, and public relations is normal\"",
        resolve: () => ({
          narrative: "Surprisingly, the honesty plays. Veterans respect the transparency.",
          apply: (st) => ({
            ...st,
            cred: Math.max(0, st.cred - 10),
            rage: Math.max(0, st.rage - 5),
          }),
        }),
      },
      {
        id: "blame_agency",
        label: "Blame the PR contractor",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Contractor takes the fall. Plausible deniability achieved.",
              apply: (st) => ({
                ...st,
                cred: Math.max(0, st.cred - 5),
                colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.01)),
              }),
            };
          }
          return {
            narrative: "Contractor gives interview about your 'management style'. Nightmare fuel.",
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
          narrative: "Lawyers send letters. Earth calls you 'the litigious commander'. Heat rises.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 20),
            rage: Math.min(100, st.rage + 10),
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.02)),
          }),
        }),
      },
    ],
  },

  {
    id: "earth_investor_threat",
    name: "Earth Investor Threatens to Withdraw",
    description: "Major backer is 'reassessing commitment' after reviewing your operations logs.",
    severity: "legendary",
    weight: (s) => (s.rage > 60 || s.cred < 40 ? 0.8 : 0.15),
    options: [
      {
        id: "incentive",
        label: "Offer extended commitment terms",
        resolve: () => ({
          narrative: "Investor accepts new terms. Reserves take a hit. Crisis deferred.",
          apply: (st) => ({
            ...st,
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.03)),
            rage: Math.max(0, st.rage - 10),
          }),
        }),
      },
      {
        id: "restructure",
        label: "Emergency mission restructure",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "New structure buys time. Crew confused but operating.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 5),
                rage: Math.min(100, st.rage + 10),
              }),
            };
          }
          return {
            narrative: "Restructure seen as desperation. Mission value drops anyway.",
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
        label: "Host emergency investor briefing",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.6) {
            return {
              narrative: "Briefing goes well. Investors placated. For now.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 5),
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "Briefing recording leaks. 'This is totally sustainable' clip spreads beyond internal channels.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 30),
              rage: Math.min(100, st.rage + 15),
            }),
          };
        },
      },
      {
        id: "attack_investor",
        label: "Publicly criticize the investor",
        resolve: () => ({
          narrative: "Sponsor withdraws everything. Funding confidence collapses. But your reputation for boldness grows.",
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
    id: "legal_memo",
    name: "\"Is This Legal?\" Analysis Circulates",
    description: "A legal reviewer published a critical memo questioning your operational practices.",
    severity: "high",
    weight: (s) => (s.oversightPressure > 40 ? 0.7 : 0.25),
    options: [
      {
        id: "lawyer",
        label: "Emergency legal consultation",
        resolve: () => ({
          narrative: "Lawyers advise 'no comment'. You post 'no comment'. Heat rises anyway.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 15),
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.015)),
          }),
        }),
      },
      {
        id: "narrative",
        label: "Change narrative to 'pure exploration'",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "New narrative sticks. 'It's for science!'",
              apply: (st) => ({
                ...st,
                oversightPressure: Math.max(0, st.oversightPressure - 10),
                cred: Math.max(0, st.cred - 5),
              }),
            };
          }
          return {
            narrative: "Oversight intern screenshots your extraction figures. Zero science found.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 25),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "ignore",
        label: "Pretend you didn't see it",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Analysis dies. Algorithm buries it. Crisis averted.",
              apply: (st) => ({
                ...st,
                hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny + 0.15 },
              }),
            };
          }
          return {
            narrative: "Analysis gets picked up by major outlets. Your comms are on fire.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 35),
              rage: Math.min(100, st.rage + 10),
            }),
          };
        },
      },
      {
        id: "meme",
        label: "Attempt a charm offensive",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.35) {
            return {
              narrative: "'We're pioneers, not accountants' lands well. Public support grows.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 20),
                cred: Math.min(100, st.cred + 5),
              }),
            };
          }
          return {
            narrative: "Earth oversight does not find this funny. Investigation incoming.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 40),
              cred: Math.max(0, st.cred - 20),
            }),
          };
        },
      },
    ],
  },

  {
    id: "fake_breakthrough",
    name: "Breakthrough Claim Proven False",
    description: "Your 'major discovery' announcement was based on flawed data. Analysts noticed.",
    severity: "medium",
    weight: (s) => (s.cred > 40 ? 0.5 : 0.2),
    options: [
      {
        id: "intern",
        label: "\"Junior researcher made a mistake\"",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.6) {
            return {
              narrative: "Researcher takes the fall. Reassign them publicly for extra points.",
              apply: (st) => ({
                ...st,
                cred: Math.max(0, st.cred - 10),
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "People find the researcher doesn't exist in any records. Oops.",
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
        label: "\"It was a data interpretation issue\"",
        resolve: () => ({
          narrative: "Technical jargon softens the blow. People move on eventually.",
          apply: (st) => ({
            ...st,
            cred: Math.max(0, st.cred - 15),
          }),
        }),
      },
      {
        id: "real_discovery",
        label: "Rush to make a REAL discovery",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "You actually find something significant. Redemption arc begins.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 15),
                techHype: Math.min(100, st.techHype + 10),
                tokenPrice: st.tokenPrice * 1.1,
              }),
            };
          }
          return {
            narrative: "No real discovery materializes. You're triple-cooked.",
            apply: (st) => ({
              ...st,
              cred: Math.max(0, st.cred - 30),
              rage: Math.min(100, st.rage + 25),
            }),
          };
        },
      },
      {
        id: "attack_critics",
        label: "\"This is coordinated sabotage\"",
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
    id: "engineering_mutiny",
    name: "Engineering Team Mutiny",
    description: "Lead engineer just posted a message about 'toxic command culture'. Three others endorsed it.",
    severity: "high",
    weight: (s) => (s.hidden.founderStability < 0.6 ? 1.0 : 0.25),
    options: [
      {
        id: "raise_compensation",
        label: "Emergency compensation increase",
        resolve: () => ({
          narrative: "Resources talk. Engineers delete the post. For now.",
          apply: (st) => ({
            ...st,
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.025)),
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
              narrative: "New team works faster. Old team complains on Earth channels.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 10),
                cred: Math.max(0, st.cred - 15),
              }),
            };
          }
          return {
            narrative: "New team can't access the critical systems. Timeline delayed 6 months.",
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
        label: "Remind them about contracts",
        resolve: () => ({
          narrative: "Engineers go quiet. But system maintenance stops too. Suspicious.",
          apply: (st) => ({
            ...st,
            techHype: Math.max(0, st.techHype - 15),
            oversightPressure: Math.min(100, st.oversightPressure + 10),
          }),
        }),
      },
      {
        id: "roadmap",
        label: "Publish ambitious mission roadmap",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Roadmap distracts everyone. 'Phase 3 Terraforming' excites.",
              apply: (st) => ({
                ...st,
                techHype: Math.min(100, st.techHype + 15),
                rage: Math.max(0, st.rage - 10),
              }),
            };
          }
          return {
            narrative: "Lead engineer replies: 'We cannot build any of this.' A blunt response.",
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
    id: "earth_recall_threat",
    name: "Earth Threatens Mission Recall",
    description: "Earth HQ just messaged about 'operational concerns'. 72 hours to respond.",
    severity: "legendary",
    weight: (s) => (s.oversightPressure > 50 ? 0.6 : 0.1),
    options: [
      {
        id: "pivot",
        label: "Immediate operational pivot",
        resolve: () => ({
          narrative: "Emergency restructuring theater. Earth buys it. For now.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.max(0, st.oversightPressure - 20),
            cred: Math.max(0, st.cred - 10),
            rage: Math.min(100, st.rage + 10),
          }),
        }),
      },
      {
        id: "pay",
        label: "Offer accelerated returns",
        resolve: () => ({
          narrative: "Reserves bleed, but recall avoided. Classic.",
          apply: (st) => ({
            ...st,
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.05)),
            oversightPressure: Math.max(0, st.oversightPressure - 25),
          }),
        }),
      },
      {
        id: "media",
        label: "Rally public Earth support",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Public campaign works. Recall pressure eases.",
              apply: (st) => ({
                ...st,
                oversightPressure: Math.max(0, st.oversightPressure - 15),
                cred: Math.min(100, st.cred + 10),
              }),
            };
          }
          return {
            narrative: "Campaign backfires. 'Rogue commander' narrative sticks.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 20),
              cred: Math.max(0, st.cred - 15),
            }),
          };
        },
      },
      {
        id: "ignore",
        label: "Go dark",
        resolve: () => ({
          narrative: "Radio silence. Earth escalates. This is now an incident.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 40),
            hidden: { ...st.hidden, communityMemory: st.hidden.communityMemory + 0.3 },
          }),
        }),
      },
    ],
  },

  {
    id: "rival_colony",
    name: "Rival Colony Attacks Your Reputation",
    description: "Competing Mars settlement is circulating a critical report about your operations.",
    severity: "medium",
    weight: (s) => (s.cred > 30 ? 0.5 : 0.2),
    options: [
      {
        id: "counter",
        label: "Release counter-report",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Your report lands harder. Rival looks petty.",
              apply: (st) => ({
                ...st,
                cred: Math.min(100, st.cred + 10),
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "Report war escalates. Earth is concerned about 'Mars drama'.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 15),
              rage: Math.min(100, st.rage + 10),
            }),
          };
        },
      },
      {
        id: "ignore",
        label: "Take the high road",
        resolve: () => ({
          narrative: "Silence reads as dignity. Some respect it.",
          apply: (st) => ({
            ...st,
            cred: Math.min(100, st.cred + 5),
            rage: Math.min(100, st.rage + 5),
          }),
        }),
      },
      {
        id: "ally",
        label: "Reach out to ally",
        resolve: () => ({
          narrative: "Allied colony defends you. Costs some goodwill but works.",
          apply: (st) => ({
            ...st,
            colonyReserves: Math.max(0, st.colonyReserves - Math.floor(st.colonyReserves * 0.01)),
            rage: Math.max(0, st.rage - 10),
          }),
        }),
      },
    ],
  },

  {
    id: "investigation_notice",
    name: "Earth Investigation Notice",
    description: "Formal notice of investigation into colony operations received.",
    severity: "legendary",
    weight: (s) => (s.hidden.scrutiny > 0.5 ? 0.8 : 0.1),
    options: [
      {
        id: "cooperate",
        label: "Full cooperation",
        resolve: () => ({
          narrative: "Cooperation noted. Investigation proceeds but you're not obstructing.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 10),
            cred: Math.min(100, st.cred + 5),
            hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny - 0.1 },
          }),
        }),
      },
      {
        id: "delay",
        label: "Procedural delays",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.4) {
            return {
              narrative: "Delays work. Investigation loses momentum.",
              apply: (st) => ({
                ...st,
                oversightPressure: Math.max(0, st.oversightPressure - 5),
              }),
            };
          }
          return {
            narrative: "Delays seen as obstruction. Heat intensifies.",
            apply: (st) => ({
              ...st,
              oversightPressure: Math.min(100, st.oversightPressure + 25),
              cred: Math.max(0, st.cred - 10),
            }),
          };
        },
      },
      {
        id: "scapegoat",
        label: "Offer a scapegoat",
        resolve: () => ({
          narrative: "Subordinate takes fall. Investigation refocuses.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.max(0, st.oversightPressure - 15),
            cred: Math.max(0, st.cred - 10),
            hidden: { ...st.hidden, founderStability: st.hidden.founderStability - 0.1 },
          }),
        }),
      },
    ],
  },

  {
    id: "infrastructure_sabotage",
    name: "Infrastructure Sabotage Suspected",
    description: "Critical systems showing signs of deliberate tampering.",
    severity: "high",
    weight: (s) => (s.hidden.scrutiny > 0.3 ? 0.7 : 0.2),
    options: [
      {
        id: "investigate",
        label: "Launch internal investigation",
        resolve: (s, rng) => {
          void s;
          if (rng() < 0.5) {
            return {
              narrative: "Saboteur found and dealt with quietly.",
              apply: (st) => ({
                ...st,
                hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny - 0.15 },
                rage: Math.max(0, st.rage - 5),
              }),
            };
          }
          return {
            narrative: "Investigation finds nothing. Paranoia spreads.",
            apply: (st) => ({
              ...st,
              rage: Math.min(100, st.rage + 15),
              hidden: { ...st.hidden, founderStability: st.hidden.founderStability - 0.1 },
            }),
          };
        },
      },
      {
        id: "lockdown",
        label: "Colony lockdown",
        resolve: () => ({
          narrative: "Lockdown contains the issue but crew is furious.",
          apply: (st) => ({
            ...st,
            rage: Math.min(100, st.rage + 20),
            cred: Math.max(0, st.cred - 5),
            hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny - 0.1 },
          }),
        }),
      },
      {
        id: "outside_help",
        label: "Request Earth assistance",
        resolve: () => ({
          narrative: "Earth sends investigators. Oversight increases significantly.",
          apply: (st) => ({
            ...st,
            oversightPressure: Math.min(100, st.oversightPressure + 20),
            hidden: { ...st.hidden, scrutiny: st.hidden.scrutiny - 0.2 },
          }),
        }),
      },
    ],
  },
];

export function pickCrisis(state: GameState, rng: RNG, _season: SeasonDef): CrisisDef | null {
  const weights = CRISES.map((c) => c.weight(state));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < CRISES.length; i++) {
    r -= weights[i];
    if (r <= 0) return CRISES[i];
  }
  return CRISES[CRISES.length - 1];
}

// Wrapper that applies chance-based gating
export function maybePickCrisis(state: GameState, rng: RNG, season: SeasonDef): CrisisDef | null {
  // Grace period: no crises in early turns (let player learn)
  if (state.turn <= 3) return null;

  // Base 10% chance per turn, modified by hidden scrutiny and season
  const base = 0.1;
  const riskBonus = state.hidden.scrutiny * 0.25; // up to +25% if scrutiny is 1.0
  const seasonFactor = season.crisisFactor ?? 1.0;
  const chance = Math.min(0.5, (base + riskBonus) * seasonFactor); // cap at 50%

  if (rng() > chance) return null;
  return pickCrisis(state, rng, season);
}

// Resolve a chosen crisis option
export function resolveCrisisOption(
  state: GameState,
  optionId: string,
  rng: RNG
): { narrative: string; state: GameState } | null {
  const crisis = state.pendingCrisis;
  if (!crisis) return null;

  const option = crisis.options.find(o => o.id === optionId);
  if (!option) return null;

  const outcome = option.resolve(state, rng);
  const newState = outcome.apply(state);

  return {
    narrative: outcome.narrative,
    state: {
      ...newState,
      pendingCrisis: undefined,
      crisisCount: newState.crisisCount + 1,
    },
  };
}

