import type { GameState } from "./state";
import type { SeasonDef } from "./seasons";

export type EventId =
  // Communications events (renamed from crypto)
  | "commander_outburst"
  | "external_analyst_thread"
  | "supply_manifest_discrepancy"
  | "life_support_integrity_issue"
  | "contractor_withdrawal"
  | "audit_notice"
  | "team_comms_leak"
  | "archive_compilation"
  | "reserve_management_noticed"
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
  // === COMMUNICATIONS / COMMAND EVENTS ===
  {
    id: "commander_outburst",
    name: "Commander Outburst in Comms",
    weight: (s, season) => {
      void season;
      return s.rage > 50 ? 2 : 0.3;
    },
    apply: (s) => {
      const log = `You argued with a junior officer on open comms for 3 hours. The transcript circulates.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 15),
        cred: Math.max(0, s.cred - 15),
        hidden: {
          ...s.hidden,
          founderStability: s.hidden.founderStability - 0.2,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        recentEvents: ["commander_outburst", ...s.recentEvents].slice(0, 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "external_analyst_thread",
    name: "External Analyst Publishes Critical Analysis",
    weight: (s, season) => {
      void season;
      return s.hidden.scrutiny > 0.2 ? 2 : 0.5;
    },
    apply: (s) => {
      const log = `Earth analyst publishes detailed report on your resource allocation patterns.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 10),
        oversightPressure: Math.min(100, s.oversightPressure + 10),
        recentEvents: ["external_analyst_thread", ...s.recentEvents].slice(0, 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "supply_manifest_discrepancy",
    name: "Supply Manifest Discrepancy",
    weight: (s, season) => {
      void season;
      return s.hidden.scrutiny > 0.3 ? 0.8 : 0.15;
    },
    apply: (s) => {
      const discrepancy = Math.floor(s.colonyReserves * (0.1 + Math.random() * 0.15)); // 10-25% of reserves
      const log = `📋 SUPPLY DISCREPANCY: Audit reveals ${(discrepancy / 1_000_000).toFixed(1)}M in unaccounted materials. Oversight intensifies.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - discrepancy),
        tokenPrice: s.tokenPrice * 0.7, // 30% confidence drop
        rage: Math.min(100, s.rage + 25),
        oversightPressure: Math.min(100, s.oversightPressure + 25),
        cred: Math.max(0, s.cred - 20),
        hidden: {
          ...s.hidden,
          scrutiny: Math.min(1, s.hidden.scrutiny + 0.3),
          communityMemory: s.hidden.communityMemory + 0.3,
        },
        log: [log, ...s.log],
        recentEvents: ["supply_manifest_discrepancy", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "life_support_integrity_issue",
    name: "Life Support Integrity Issue",
    weight: (s, season) => {
      void season;
      return s.techHype > 50 ? 0.4 : 0.2;
    },
    apply: (s) => {
      const severity = Math.random();
      if (severity > 0.7) {
        // Critical - resources at risk
        const lostResources = Math.floor(s.colonyReserves * 0.08);
        const log = `🚨 CRITICAL SYSTEMS FAILURE: Life support cascade. Emergency reserves deployed.`;
        return {
          ...s,
          colonyReserves: Math.max(0, s.colonyReserves - lostResources),
          tokenPrice: s.tokenPrice * 0.75,
          rage: Math.min(100, s.rage + 25),
          techHype: Math.max(0, s.techHype - 25),
          cred: Math.max(0, s.cred - 20),
          log: [log, ...s.log],
          recentEvents: ["life_support_integrity_issue", ...s.recentEvents].slice(0, 5),
        };
      }
      // Minor issue - just concerning
      const log = `🔧 Systems integrity issue identified. Engineering team addresses before escalation.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - Math.floor(s.colonyReserves * 0.005)), // Repair costs
        techHype: Math.max(0, s.techHype - 10),
        cred: Math.max(0, s.cred - 5),
        log: [log, ...s.log],
        recentEvents: ["life_support_integrity_issue", ...s.recentEvents].slice(0, 5),
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
      const log = `📉 CONTRACTOR WITHDRAWAL: Major Earth sponsor pulled ${withdrawalPct}% of committed funding. Confidence drops.`;
      return {
        ...s,
        tokenPrice: s.tokenPrice * (0.65 + Math.random() * 0.15), // 20-35% drop
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
    name: "Earth Oversight Sends Notice",
    weight: (s, season) => {
      void season;
      return s.hidden.scrutiny > 0.4 ? 1.5 : 0; // Only triggers if audit risk is high
    },
    apply: (s) => {
      const isSevere = s.hidden.scrutiny > 0.7;
      const log = isSevere
        ? `📋 Earth oversight requests 'urgent clarification' on resource allocations. This is serious.`
        : `📋 Auditors asking questions about 'expense categorization.' Standard procedure—for now.`;
      return {
        ...s,
        oversightPressure: Math.min(100, s.oversightPressure + (isSevere ? 25 : 12)),
        cred: Math.max(0, s.cred - (isSevere ? 10 : 5)),
        hidden: {
          ...s.hidden,
          scrutiny: s.hidden.scrutiny + 0.1, // Gets worse if you ignore it
        },
        log: [log, ...s.log],
        recentEvents: ["audit_notice", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "team_comms_leak",
    name: "Internal Comms Leak",
    weight: (s, season) => {
      void season;
      return s.hidden.founderStability < 0.5 ? 1.2 : 0; // Only when team is unstable
    },
    apply: (s) => {
      const log = `💬 Someone leaked internal comms. Your private remarks about the mission being 'unsalvageable' reach Earth.`;
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
        recentEvents: ["team_comms_leak", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "archive_compilation",
    name: "Archive Compiles Broken Commitments",
    weight: (s, season) => {
      void season;
      return s.hidden.communityMemory > 0.3 ? 1.0 : 0; // Triggers when community has long memory
    },
    apply: (s) => {
      const log = `🧵 Anonymous analyst compiles all your missed targets. 'The Complete Command Failure Timeline' circulates on Earth.`;
      return {
        ...s,
        rage: Math.min(100, s.rage + 15),
        cred: Math.max(0, s.cred - 8),
        hidden: {
          ...s.hidden,
          communityMemory: s.hidden.communityMemory + 0.1,
        },
        log: [log, ...s.log],
        recentEvents: ["archive_compilation", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "reserve_management_noticed",
    name: "Reserve Management Noticed",
    weight: (s, season) => {
      void season;
      return s.hidden.reserveLiquidity > 0.5 ? 0.8 : 0; // Reward for good resource management
    },
    apply: (s) => {
      const log = `📊 External crisis tests resources, but your reserves are well-managed. Earth oversight impressed.`;
      return {
        ...s,
        cred: Math.min(100, s.cred + 10),
        rage: Math.max(0, s.rage - 8),
        oversightPressure: Math.max(0, s.oversightPressure - 5),
        log: [log, ...s.log],
        recentEvents: ["reserve_management_noticed", ...s.recentEvents].slice(0, 5),
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
        colonyReserves: Math.max(0, s.colonyReserves * 0.95),
        techHype: Math.max(0, s.techHype - 8),
        hidden: {
          ...s.hidden,
          scrutiny: s.hidden.scrutiny + 0.05,
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
        oversightPressure: Math.max(0, s.oversightPressure - 15),
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
      const lostReserves = Math.floor(s.colonyReserves * 0.15);
      const log = `🚀 Supply ship delayed by 6 months. Rationing protocols engaged. Reserves -15%.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - lostReserves),
        rage: Math.min(100, s.rage + 10),
        log: [log, ...s.log],
        recentEvents: ["supply_ship_delay", ...s.recentEvents].slice(0, 5),
      };
    },
  },
  {
    id: "hab_malfunction",
    name: "Habitat Malfunction",
    weight: (s) => s.hidden.scrutiny > 0.3 ? 0.8 : 0.3,
    apply: (s) => {
      const log = `🔧 Critical habitat malfunction. Emergency repairs drain resources and spike system strain.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves * 0.9),
        hidden: {
          ...s.hidden,
          scrutiny: s.hidden.scrutiny + 0.2,
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
    weight: (s) => s.hidden.scrutiny > 0.5 ? 1.0 : 0.2,
    apply: (s) => {
      const log = `💧 Water reclaimer failure! This could trigger a full crisis if not addressed.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves * 0.85),
        rage: Math.min(100, s.rage + 20),
        cred: Math.max(0, s.cred - 10),
        hidden: {
          ...s.hidden,
          scrutiny: s.hidden.scrutiny + 0.15,
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
        : `📰 Earth media runs critical piece on colony management. Oversight intensifies.`;
      return {
        ...s,
        oversightPressure: positive ? Math.max(0, s.oversightPressure - 10) : Math.min(100, s.oversightPressure + 10),
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

export const EVENTS: EventDef[] = BASE_EVENTS;

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
