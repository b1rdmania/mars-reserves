import type { GameState } from "./state";
import type { SeasonDef } from "./seasons";
import { SCANDAL_FRAGMENTS } from "../content/events.web3";

export type EventId =
  | "founder_meltdown"
  | "influencer_thread"
  | "vitalik_tag"
  | "meme_coin_summer"
  | "influencer_livestream"
  | "conference_backroom_rumour"
  | "cofounder_ragequit"
  | "vc_tweetstorm"
  | "solana_outage"
  | "bridge_hack"
  | "smart_contract_bug"
  | "contractor_withdrawal"
  | "scandal_fragment"
  | "audit_notice"
  | "team_discord_leak"
  | "community_never_forgets"
  | "diversification_pays_off"
  // Mars environment events
  | "dust_storm"
  | "solar_flare"
  | "supply_ship_delay"
  | "hab_malfunction"
  | "water_reclaimer_failure"
  | "research_breakthrough"
  | "earth_news_cycle"
  | "crew_morale_boost";

export interface EventDef {
  id: EventId;
  name: string;
  weight: (s: GameState, season: SeasonDef) => number;
  apply: (s: GameState) => GameState;
}

const BASE_EVENTS: EventDef[] = [
  {
    id: "founder_meltdown",
    name: "Founder Meltdown in Discord",
    weight: (s, season) => {
      void season;
      return s.rage > 50 ? 2 : 0.3;
    },
    apply: (s) => {
      const log = `You argued with a 19-year-old anon in Discord for 3 hours. Screenshots everywhere.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 15),
        cred: Math.max(0, s.cred - 15),
        hidden: {
          ...s.hidden,
          founderStability: s.hidden.founderStability - 0.2,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        recentEvents: ["founder_meltdown", ...s.recentEvents].slice(0, 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "influencer_thread",
    name: "Influencer Threads You",
    weight: (s, season) => {
      void season;
      return s.hidden.auditRisk > 0.2 ? 2 : 0.5;
    },
    apply: (s) => {
      const log = `Influencer posts a 19-tweet thread about your treasury flows.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 10),
        heat: Math.min(100, s.heat + 10),
        recentEvents: ["influencer_thread", ...s.recentEvents].slice(0, 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "vitalik_tag",
    name: "Vitalik Replies",
    weight: (s, season) => {
      void season;
      return s.cred > 60 ? 1.5 : 0.05;
    },
    apply: (s) => {
      const log = `Vitalik replies to your post with something ambiguous but positive.`;
      return {
        ...s,
        cred: Math.min(100, s.cred + 20),
        heat: Math.min(100, s.heat + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "meme_coin_summer",
    name: "Meme Coin Summer",
    weight: (_s, season) => {
      void season;
      return 0.1;
    },
    apply: (s) => {
      const log = `Meme Coin Summer hits. Everyone is distracted by penguin coins.`;
      return {
        ...s,
        rage: Math.max(0, s.rage - 15),
        techHype: Math.min(100, s.techHype + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "influencer_livestream",
    name: "Influencer Livestream Slip-up",
    weight: (s, season) => {
      void season;
      return s.cred > 30 ? 0.8 : 0.3;
    },
    apply: (s) => {
      const rageSpike = s.hidden.communityMemory > 0.3 ? 25 : 15;
      const log = `You rambled on a livestream and hinted at token plans. Clips go viral.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + rageSpike),
        heat: Math.min(100, s.heat + 10),
        cred: Math.max(0, s.cred - 10),
        hidden: {
          ...s.hidden,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        log: [log, ...s.log],
        recentEvents: ["influencer_livestream", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "conference_backroom_rumour",
    name: "Conference Backroom Rumour",
    weight: (s, season) => {
      void season;
      return s.techHype > 20 ? 0.9 : 0.3;
    },
    apply: (s) => {
      const log = `Backroom whispers say your protocol has a secret partnership.`;
      return {
        ...s,
        cred: Math.min(100, s.cred + 10),
        heat: Math.min(100, s.heat + 8),
        log: [log, ...s.log],
        recentEvents: ["conference_backroom_rumour", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "cofounder_ragequit",
    name: "Co-Founder Rage Quits",
    weight: (s, season) => {
      void season;
      return s.hidden.founderStability < 0.6 ? 0.8 : 0.1;
    },
    apply: (s) => {
      const log = `Your co-founder posts a long goodbye note. Community panics.`;
      return {
        ...s,
        cred: Math.max(0, s.cred - 25),
        rage: Math.min(100, s.rage + 10),
        hidden: {
          ...s.hidden,
          founderStability: Math.max(0, s.hidden.founderStability - 0.4),
        },
        log: [log, ...s.log],
        recentEvents: ["cofounder_ragequit", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "vc_tweetstorm",
    name: "VC Tweetstorm",
    weight: (_s, season) => {
      void season;
      return 0.6;
    },
    apply: (s) => {
      const log = `A top VC threads your protocol as “the future of everything”.`;
      return {
        ...s,
        techHype: Math.min(100, s.techHype + 30),
        heat: Math.min(100, s.heat + 10),
        cred: Math.min(100, s.cred + 5),
        log: [log, ...s.log],
        recentEvents: ["vc_tweetstorm", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "solana_outage",
    name: "Solana Outage",
    weight: (_s, season) => {
      void season;
      return 0.3;
    },
    apply: (s) => {
      const log = `Solana goes down; everyone stops yelling at you for a moment.`;
      return {
        ...s,
        rage: Math.max(0, s.rage - 15),
        heat: Math.max(0, s.heat - 5),
        techHype: Math.min(100, s.techHype + 5),
        log: [log, ...s.log],
        recentEvents: ["solana_outage", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "bridge_hack",
    name: "Bridge Exploit",
    weight: (s, season) => {
      void season;
      // More likely if audit risk is high
      return s.hidden.auditRisk > 0.3 ? 0.8 : 0.15;
    },
    apply: (s) => {
      const hackAmount = Math.floor(s.tvl * (0.1 + Math.random() * 0.2)); // 10-30% of TVL
      const log = `🚨 BRIDGE EXPLOIT: Hackers drained $${(hackAmount / 1_000_000).toFixed(1)}M from the bridge. TVL nuked.`;
      return {
        ...s,
        tvl: Math.max(10_000_000, s.tvl - hackAmount),
        tokenPrice: s.tokenPrice * 0.6, // 40% crash
        officialTreasury: s.officialTreasury * 0.85, // Treasury takes a hit too
        rage: Math.min(100, s.rage + 35),
        heat: Math.min(100, s.heat + 25),
        cred: Math.max(0, s.cred - 30),
        hidden: {
          ...s.hidden,
          auditRisk: Math.min(1, s.hidden.auditRisk + 0.3),
          communityMemory: s.hidden.communityMemory + 0.3,
        },
        log: [log, ...s.log],
        recentEvents: ["bridge_hack", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "smart_contract_bug",
    name: "Smart Contract Bug Found",
    weight: (s, season) => {
      void season;
      return s.techHype > 50 ? 0.4 : 0.2; // Ironic: more hype = more scrutiny
    },
    apply: (s) => {
      const severity = Math.random();
      if (severity > 0.7) {
        // Critical bug - funds at risk
        const lostFunds = Math.floor(s.tvl * 0.08);
        const log = `🐛 CRITICAL BUG: Whitehat discloses infinite mint bug. Some funds drained before patch.`;
        return {
          ...s,
          tvl: s.tvl - lostFunds,
          tokenPrice: s.tokenPrice * 0.75,
          rage: Math.min(100, s.rage + 25),
          techHype: Math.max(0, s.techHype - 25),
          cred: Math.max(0, s.cred - 20),
          log: [log, ...s.log],
          recentEvents: ["smart_contract_bug", ...s.recentEvents].slice(0, 5),
        };
      }
      // Minor bug - just embarrassing
      const log = `🐛 Bug bounty payout: researcher found an edge case. Fixed before exploit.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - Math.floor(s.officialTreasury * 0.005)), // Bounty payment
        techHype: Math.max(0, s.techHype - 10),
        cred: Math.max(0, s.cred - 5),
        log: [log, ...s.log],
        recentEvents: ["smart_contract_bug", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "contractor_withdrawal",
    name: "Prime Contractor Withdraws",
    weight: (s, season) => {
      void season;
      return s.rage > 40 ? 0.6 : 0.2;
    },
    apply: (s) => {
      const withdrawalPct = 5 + Math.floor(Math.random() * 10); // 5-15% of funding
      const log = `📉 CONTRACTOR WITHDRAWAL: Major Earth sponsor just pulled ${withdrawalPct}% of committed funding. Supply index in freefall.`;
      return {
        ...s,
        tokenPrice: s.tokenPrice * (0.65 + Math.random() * 0.15), // 20-35% crash
        rage: Math.min(100, s.rage + 20),
        cred: Math.max(0, s.cred - 10),
        log: [log, ...s.log],
        recentEvents: ["contractor_withdrawal", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  // === HIDDEN STATE TRIGGER EVENTS ===
  {
    id: "audit_notice",
    name: "Audit Firm Sends Notice",
    weight: (s, season) => {
      void season;
      return s.hidden.auditRisk > 0.4 ? 1.5 : 0; // Only triggers if audit risk is high
    },
    apply: (s) => {
      const isSevere = s.hidden.auditRisk > 0.7;
      const log = isSevere
        ? `📋 Big 4 firm requests 'urgent clarification' on treasury movements. This is bad.`
        : `📋 Auditors asking questions about 'expense categorization.' Stay calm.`;
      return {
        ...s,
        heat: Math.min(100, s.heat + (isSevere ? 25 : 12)),
        cred: Math.max(0, s.cred - (isSevere ? 10 : 5)),
        hidden: {
          ...s.hidden,
          auditRisk: s.hidden.auditRisk + 0.1, // Gets worse if you ignore it
        },
        log: [log, ...s.log],
        recentEvents: ["audit_notice", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "team_discord_leak",
    name: "Team Discord Leak",
    weight: (s, season) => {
      void season;
      return s.hidden.founderStability < 0.5 ? 1.2 : 0; // Only when team is unstable
    },
    apply: (s) => {
      const log = `💬 Someone leaked internal comms. Screenshots of you calling the mission 'unsalvageable' went viral on Earth.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 20),
        cred: Math.max(0, s.cred - 15),
        hidden: {
          ...s.hidden,
          founderStability: s.hidden.founderStability - 0.15,
          communityMemory: s.hidden.communityMemory + 0.2,
        },
        log: [log, ...s.log],
        recentEvents: ["team_discord_leak", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "community_never_forgets",
    name: "Community Never Forgets",
    weight: (s, season) => {
      void season;
      return s.hidden.communityMemory > 0.3 ? 1.0 : 0; // Triggers when community has long memory
    },
    apply: (s) => {
      const log = `🧵 Anonymous post compiles all your broken commitments. 'The Complete Command Failure Timeline.' Gaining traction on Earth.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 15),
        cred: Math.max(0, s.cred - 8),
        hidden: {
          ...s.hidden,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        log: [log, ...s.log],
        recentEvents: ["community_never_forgets", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "diversification_pays_off",
    name: "Diversification Pays Off",
    weight: (s, season) => {
      void season;
      return s.hidden.stablecoinRatio > 0.5 ? 0.8 : 0; // Reward for good treasury management
    },
    apply: (s) => {
      const log = `📊 Market dips 30%, but your treasury is mostly stables. CT impressed. 'Actually based treasury management.'`;
      return {
        ...s,
        cred: Math.min(100, s.cred + 10),
        rage: Math.max(0, s.rage - 8),
        heat: Math.max(0, s.heat - 5),
        log: [log, ...s.log],
        recentEvents: ["diversification_pays_off", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  // === MARS ENVIRONMENT EVENTS ===
  {
    id: "dust_storm",
    name: "Dust Storm",
    weight: () => 0.6,
    apply: (s) => {
      const log = `🌪️ Massive dust storm blankets the colony. Operations halted for emergency protocols.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury * 0.95),
        techHype: Math.max(0, s.techHype - 8),
        hidden: {
          ...s.hidden,
          auditRisk: s.hidden.auditRisk + 0.05,
        },
        log: [log, ...s.log],
        recentEvents: ["dust_storm", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "solar_flare",
    name: "Solar Flare",
    weight: () => 0.4,
    apply: (s) => {
      const log = `☀️ Solar flare disrupts communications. Earth oversight temporarily blinded.`;
      return {
        ...s,
        heat: Math.max(0, s.heat - 15),
        techHype: Math.max(0, s.techHype - 5),
        log: [log, ...s.log],
        recentEvents: ["solar_flare", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "supply_ship_delay",
    name: "Supply Ship Delay",
    weight: () => 0.5,
    apply: (s) => {
      const lostReserves = Math.floor(s.officialTreasury * 0.15);
      const log = `🚀 Supply ship delayed by 6 months. Rationing protocols engaged. Reserves -15%.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - lostReserves),
        rage: Math.min(100, s.rage + 10),
        log: [log, ...s.log],
        recentEvents: ["supply_ship_delay", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "hab_malfunction",
    name: "Habitat Malfunction",
    weight: (s) => s.hidden.auditRisk > 0.3 ? 0.8 : 0.3,
    apply: (s) => {
      const log = `🔧 Critical habitat malfunction. Emergency repairs drain resources and spike system strain.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury * 0.9),
        hidden: {
          ...s.hidden,
          auditRisk: s.hidden.auditRisk + 0.2,
        },
        rage: Math.min(100, s.rage + 8),
        log: [log, ...s.log],
        recentEvents: ["hab_malfunction", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "water_reclaimer_failure",
    name: "Water Reclaimer Failure",
    weight: (s) => s.hidden.auditRisk > 0.5 ? 1.0 : 0.2,
    apply: (s) => {
      const log = `💧 Water reclaimer failure! This could trigger a full crisis if not addressed.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury * 0.85),
        rage: Math.min(100, s.rage + 20),
        cred: Math.max(0, s.cred - 10),
        hidden: {
          ...s.hidden,
          auditRisk: s.hidden.auditRisk + 0.15,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        log: [log, ...s.log],
        recentEvents: ["water_reclaimer_failure", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "research_breakthrough",
    name: "Research Breakthrough",
    weight: (s) => s.techHype > 40 ? 0.7 : 0.3,
    apply: (s) => {
      const log = `🔬 Major research breakthrough! Your team publishes findings that boost mission credibility.`;
      return {
        ...s,
        techHype: Math.min(100, s.techHype + 25),
        cred: Math.min(100, s.cred + 10),
        rage: Math.max(0, s.rage - 5),
        log: [log, ...s.log],
        recentEvents: ["research_breakthrough", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "earth_news_cycle",
    name: "Earth News Cycle",
    weight: () => 0.5,
    apply: (s) => {
      const positive = Math.random() > 0.5;
      const log = positive
        ? `📰 Earth media runs positive story on Mars colony. Public support surges.`
        : `📰 Earth media runs hit piece on colony management. Oversight intensifies.`;
      return {
        ...s,
        heat: positive ? Math.max(0, s.heat - 10) : Math.min(100, s.heat + 10),
        cred: positive ? Math.min(100, s.cred + 5) : Math.max(0, s.cred - 5),
        log: [log, ...s.log],
        recentEvents: ["earth_news_cycle", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "crew_morale_boost",
    name: "Crew Morale Boost",
    weight: (s) => s.rage > 40 ? 0.6 : 0.2,
    apply: (s) => {
      const log = `🎉 Crew celebrates mission milestone. Morale improves across all departments.`;
      return {
        ...s,
        rage: Math.max(0, s.rage - 15),
        cred: Math.min(100, s.cred + 5),
        hidden: {
          ...s.hidden,
          founderStability: Math.min(1, s.hidden.founderStability + 0.1),
        },
        log: [log, ...s.log],
        recentEvents: ["crew_morale_boost", ...s.recentEvents].slice(0, 5),
      };
    },
  },
];

function severityToWeight(severity?: string): number {
  switch (severity) {
    case "low":
      return 0.4;
    case "medium":
      return 0.7;
    case "high":
      return 1.0;
    case "very high":
      return 1.2;
    case "extreme":
      return 1.5;
    default:
      return 0.6;
  }
}

const SCANDAL_EVENTS: EventDef[] = SCANDAL_FRAGMENTS.map((frag) => ({
  id: "scandal_fragment",
  name: frag.key,
  weight: () => severityToWeight(frag.severity),
  apply: (s) => {
    const sev = frag.severity ?? "medium";
    const rageBump = sev === "extreme" ? 30 : sev === "very high" ? 22 : sev === "high" ? 16 : sev === "medium" ? 12 : 8;
    const heatBump = sev === "extreme" ? 25 : sev === "very high" ? 18 : sev === "high" ? 14 : sev === "medium" ? 10 : 6;
    const credDrop = sev === "extreme" ? 18 : sev === "very high" ? 14 : sev === "high" ? 10 : sev === "medium" ? 8 : 5;
    const log = frag.narrative;
    return {
      ...s,
      rage: Math.min(100, s.rage + rageBump),
      heat: Math.min(100, s.heat + heatBump),
      cred: Math.max(0, s.cred - credDrop),
      hidden: {
        ...s.hidden,
        communityMemory: s.hidden.communityMemory + 0.1,
        auditRisk: s.hidden.auditRisk + 0.05,
      },
      recentEvents: [frag.key, ...s.recentEvents].slice(0, 5),
      log: [log, ...s.log],
    };
  },
}));

export const EVENTS: EventDef[] = [...BASE_EVENTS, ...SCANDAL_EVENTS];

export function pickRandomEvent(state: GameState, rng: () => number, season: SeasonDef): EventDef | null {
  const candidates = EVENTS.filter((e) => e.weight(state, season) > 0);
  if (!candidates.length) return null;
  const weights = candidates.map((e) => {
    const base = e.weight(state, season);
    const mod = season.eventWeightMods?.[e.id] ?? 1;
    return base * mod;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

