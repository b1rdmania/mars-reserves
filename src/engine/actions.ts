import type { GameState } from "./state";

export type ActionCategory = "Ambition" | "Command" | "Communications" | "Crisis Response" | "Crew Relations";

export type ActionId =
  // Ambition (Legacy-building projects)
  | "mining_acceleration"
  | "external_contractors"
  | "commander_bonus"
  | "discretionary_budget"
  | "private_reserve"
  | "luxury_habitat"
  | "resource_speculation"
  | "research_grant"
  | "emergency_reserves"
  | "private_shipment"
  | "early_extraction"
  | "automated_skimming"
  // Command (formerly Governance)
  | "emergency_rationing"
  | "work_incentives"
  | "resource_reallocation"
  | "delegate_authority"
  | "suspend_protocols"
  | "crew_assembly"
  | "night_directive"
  | "ai_proposal"
  // Communications (formerly Narrative)
  | "earth_partnership"
  | "tech_milestone"
  | "mission_pivot"
  | "publish_findings"
  | "mascot_campaign"
  | "earth_broadcast"
  | "breakthrough_claim"
  | "infrastructure_announcement"
  | "terraforming_preview"
  | "investor_briefing"
  // Crisis Response (formerly Damage Control)
  | "legal_counsel"
  | "official_statement"
  | "systems_audit"
  | "counter_narrative"
  | "reassign_officer"
  | "blame_equipment"
  | "feature_not_bug"
  | "earth_lobbyist"
  | "expose_critic"
  // Crew Relations (formerly Social)
  | "crew_broadcast"
  | "senior_staff_meeting"
  | "private_reassurance"
  | "recreation_event"
  | "earth_celebrity"
  | "morale_event"
  | "rivalry_challenge"
  | "progress_display"
  | "influencer_visit"
  | "documentary_crew"
  | "podcast_interview";

export interface ActionDef {
  id: ActionId;
  category: ActionCategory;
  name: string;
  description: string;
  apply: (state: GameState) => GameState;
  visibleIf?: (state: GameState) => boolean;
  order?: number;
  tags?: string[];
  defensive?: boolean;
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export const ACTIONS: ActionDef[] = [
  // ═══════════════════════════════════════════════════════════
  // AMBITION - Legacy-building projects that compete with colony needs
  // ═══════════════════════════════════════════════════════════
  {
    id: "mining_acceleration",
    category: "Ambition",
    name: "[Your Name] Extraction Initiative",
    description: "Your name on the extraction reports.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.1);
      const log = `The ${s.founderName} Extraction Initiative exceeds quarterly targets. Crew notes the attribution.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + amount,
        rage: clamp(s.rage + 7),
        oversightPressure: clamp(s.oversightPressure + 5),
        cred: clamp(s.cred - 5),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "external_contractors",
    category: "Ambition",
    name: "Commission External Research Team",
    description: "Specialists reporting to you. Credit accordingly.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.12);
      const log = `External research team established. Publications will cite command authority.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + Math.floor(amount * 0.5),
        rage: clamp(s.rage + 8),
        oversightPressure: clamp(s.oversightPressure + 8),
        cred: clamp(s.cred - 6),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "commander_bonus",
    category: "Ambition",
    name: "Commander Recognition Fund",
    description: "You define the criteria.",
    tags: ["+Legacy", "+Unrest", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.05);
      const log = `Commander Recognition Fund established. First recipient: current command.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + amount,
        rage: clamp(s.rage + 14),
        cred: clamp(s.cred - 10),
        oversightPressure: clamp(s.oversightPressure + 5),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.1, founderStability: s.hidden.founderStability - 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "discretionary_budget",
    category: "Ambition",
    name: "Expand Discretionary Budget",
    description: "Quarters, supplies, privileges.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.06);
      const log = `Discretionary spending approved across multiple line items.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + Math.floor(amount * 0.8),
        rage: clamp(s.rage + 8),
        oversightPressure: clamp(s.oversightPressure + 6),
        cred: clamp(s.cred - 4),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "private_reserve",
    category: "Ambition",
    name: "Commander's Strategic Reserve",
    description: "Discretionary fund. Minimal oversight.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.25);
      const log = `Strategic Reserve Fund established under direct command authority.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + Math.floor(amount * 0.6),
        rage: clamp(s.rage + 12),
        oversightPressure: clamp(s.oversightPressure + 15),
        cred: clamp(s.cred - 8),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "luxury_habitat",
    category: "Ambition",
    name: "The [Your Name] Command Annex",
    description: "A dedicated command facility.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.3);
      const log = `The ${s.founderName} Command Annex opens. Earth media covers the dedication ceremony.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + Math.floor(amount * 0.5),
        rage: clamp(s.rage + 18),
        oversightPressure: clamp(s.oversightPressure + 12),
        cred: clamp(s.cred - 12),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.25, communityMemory: s.hidden.communityMemory + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "resource_speculation",
    category: "Ambition",
    name: "Resource Valuation Initiative",
    description: "Your methodology becomes standard.",
    tags: ["+Legacy", "+Momentum", "+Oversight", "+Unrest", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.08);
      const log = `Resource Valuation Initiative implemented. Your methodology becomes standard practice.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        legacy: s.legacy + Math.floor(cost * 0.4),
        techHype: clamp(s.techHype + 12),
        oversightPressure: clamp(s.oversightPressure + 12),
        rage: clamp(s.rage + 4),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "research_grant",
    category: "Ambition",
    name: "[Your Name] Research Fellowship",
    description: "Selection committee: you.",
    tags: ["+Legacy", "+Oversight", "+Unrest", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.07);
      const log = `The ${s.founderName} Fellowship announces its inaugural recipient. The selection was unanimous.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + amount,
        rage: clamp(s.rage + 10),
        oversightPressure: clamp(s.oversightPressure + 10),
        cred: clamp(s.cred - 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "emergency_reserves",
    category: "Ambition",
    name: "Emergency Contingency Reallocation",
    description: "Redirect reserves. Paperwork pending.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.15);
      const log = `Emergency reserves reallocated under contingency protocol 7-Alpha. Paperwork delayed.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + amount,
        rage: clamp(s.rage + 8),
        oversightPressure: clamp(s.oversightPressure + 10),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "private_shipment",
    category: "Ambition",
    name: "Priority Earth Consignment",
    description: "Personal transport. Manifest classified.",
    tags: ["+Legacy", "+Oversight", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.08);
      const log = `Priority consignment dispatched to Earth. Contents: research artifacts bearing command insignia.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - amount),
        legacy: s.legacy + amount,
        tokenPrice: s.tokenPrice * 0.9,
        oversightPressure: clamp(s.oversightPressure + 15),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "early_extraction",
    category: "Ambition",
    name: "Accelerated Project Timeline",
    description: "Push milestones. Your name on certificates.",
    tags: ["+Legacy", "+++Unrest", "+Oversight"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.2);
      const log = `Project acceleration authorized. Crew overtime mandated. Completion credits assigned.`;
      return {
        ...s,
        legacy: s.legacy + amount,
        rage: clamp(s.rage + 18),
        oversightPressure: clamp(s.oversightPressure + 8),
        cred: clamp(s.cred - 15),
        tokenPrice: s.tokenPrice * 0.85,
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "automated_skimming",
    category: "Ambition",
    name: "Efficiency Optimization Protocol",
    description: "Automated allocation. Command priority.",
    tags: ["+Legacy gradual", "+Oversight if discovered"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * (0.03 + Math.random() * 0.03));
      const discovered = Math.random() < 0.3;
      const log = discovered
        ? `Optimization protocol flagged by audit systems. Review initiated.`
        : `Efficiency protocol operational. Resource allocation proceeding under command oversight.`;
      return {
        ...s,
        legacy: s.legacy + amount,
        rage: clamp(s.rage + (discovered ? 20 : 0)),
        oversightPressure: clamp(s.oversightPressure + (discovered ? 15 : 3)),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + (discovered ? 0.25 : 0.05) },
        log: [log, ...s.log],
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // COMMAND (formerly Governance) - Authority and control actions
  // ═══════════════════════════════════════════════════════════
  {
    id: "emergency_rationing",
    category: "Command",
    name: "Emergency Rationing Protocol",
    description: "Refill reserves. Crew won't like it.",
    tags: ["+Reserves", "+Unrest", "-Trust", "+Oversight"],
    apply: (s) => {
      const inflow = 300;
      const log = `Emergency rationing implemented. Reserves restored, crew seethes.`;
      return {
        ...s,
        colonyReserves: s.colonyReserves + inflow,
        rage: clamp(s.rage + 25),
        cred: clamp(s.cred - 15),
        oversightPressure: clamp(s.oversightPressure + 10),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "work_incentives",
    category: "Command",
    name: "Work Incentive Adjustment",
    description: "Some benefit. Most don't.",
    tags: ["-Reserves", "+Momentum", "+/-Unrest", "-Trust"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.02);
      const log = `Work incentives restructured. Mixed response from crew.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        techHype: clamp(s.techHype + 8),
        rage: s.cred > 60 ? clamp(s.rage - 5) : clamp(s.rage + 5),
        cred: clamp(s.cred - 3),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "resource_reallocation",
    category: "Command",
    name: "Resource Reallocation",
    description: "Suspicious efficiency losses.",
    tags: ["-Reserves", "+Oversight", "-Trust", "+Legacy"],
    apply: (s) => {
      const slip = Math.floor(s.colonyReserves * 0.05);
      const log = `Resources reallocated. Some went missing in the process.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - slip),
        legacy: s.legacy + Math.floor(slip * 0.2),
        cred: clamp(s.cred - 6),
        oversightPressure: clamp(s.oversightPressure + 8),
        rage: clamp(s.rage + 6),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "delegate_authority",
    category: "Command",
    name: "Delegate Authority Program",
    description: "Appoint loyal deputies.",
    tags: ["-Reserves", "-Unrest", "+Trust", "+Oversight"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.015);
      const log = `Authority delegation program launched. Deputies are... reliable.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        rage: clamp(s.rage - 8),
        oversightPressure: clamp(s.oversightPressure + 6),
        cred: clamp(s.cred + 4),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "suspend_protocols",
    category: "Command",
    name: "Suspend Standard Protocols",
    description: "Pause procedures. 'Efficiency.'",
    tags: ["+Unrest", "+Oversight", "-Trust"],
    apply: (s) => {
      const log = `Protocols suspended. Crew forums ignite with complaints.`;
      return {
        ...s,
        rage: clamp(s.rage + 18),
        oversightPressure: clamp(s.oversightPressure + 8),
        cred: clamp(s.cred - 8),
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "crew_assembly",
    category: "Command",
    name: "Crew Assembly (Scripted)",
    description: "Pre-selected speakers. Looks democratic.",
    tags: ["+Trust", "-Unrest", "+Oversight"],
    apply: (s) => {
      const log = `Assembly went smoothly. Nobody noticed the speaker list was curated.`;
      return {
        ...s,
        cred: clamp(s.cred + 8),
        rage: clamp(s.rage - 10),
        oversightPressure: clamp(s.oversightPressure + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "night_directive",
    category: "Command",
    name: "Late Night Directive",
    description: "Orders during sleep cycle.",
    tags: ["+Reserves", "++Unrest next cycle", "-Trust"],
    apply: (s) => {
      const amount = Math.floor(s.colonyReserves * 0.02);
      const log = `Directive issued during sleep cycle. Crew waking up unhappy.`;
      return {
        ...s,
        colonyReserves: s.colonyReserves + amount,
        rage: clamp(s.rage + 18),
        cred: clamp(s.cred - 10),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "ai_proposal",
    category: "Command",
    name: "AI-Generated Proposal",
    description: "AI drafts it. Hope nobody reads it.",
    tags: ["±Trust", "±Momentum", "-Unrest minor"],
    apply: (s) => {
      const quality = Math.random();
      const log = quality > 0.5
        ? `AI proposal is coherent. Some are impressed.`
        : `AI proposal is incoherent. The transcript circulates.`;
      return {
        ...s,
        cred: clamp(s.cred + (quality > 0.5 ? 5 : -12)),
        techHype: clamp(s.techHype + (quality > 0.5 ? 8 : -5)),
        rage: clamp(s.rage + (quality > 0.5 ? -3 : 8)),
        log: [log, ...s.log],
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // COMMUNICATIONS (formerly Narrative) - Information and hype
  // ═══════════════════════════════════════════════════════════
  {
    id: "earth_partnership",
    category: "Communications",
    name: "Announce Earth Partnership",
    description: "Big-name partner. Details TBD.",
    tags: ["+Momentum", "+Trust", "-Unrest", "+Oversight"],
    apply: (s) => {
      const log = `Partnership announced. Earth has questions but excitement builds.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 15),
        cred: clamp(s.cred + 8),
        rage: clamp(s.rage - 8),
        oversightPressure: clamp(s.oversightPressure + 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "tech_milestone",
    category: "Communications",
    name: "Ship Tech Milestone",
    description: "Deliver something. Calms people.",
    tags: ["-Unrest", "+Trust", "+Momentum", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.02);
      const log = `Technical milestone achieved. Communications channels are impressed.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        rage: clamp(s.rage - 10),
        cred: clamp(s.cred + 10),
        techHype: clamp(s.techHype + 20),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "mission_pivot",
    category: "Communications",
    name: "Announce Mission Pivot",
    description: "Rebrand the mission. Bold move.",
    tags: ["-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const log = `Mission pivot announced. Earth investors applaud, crew is confused.`;
      return {
        ...s,
        rage: clamp(s.rage - 5),
        cred: clamp(s.cred + 5),
        techHype: clamp(s.techHype + 15),
        oversightPressure: clamp(s.oversightPressure + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "publish_findings",
    category: "Communications",
    name: "Publish Research Findings",
    description: "Release a paper. Academics argue.",
    tags: ["-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const log = `Research published. Academics argue for 48 hours.`;
      return {
        ...s,
        cred: clamp(s.cred + 6),
        rage: clamp(s.rage - 6),
        techHype: clamp(s.techHype + 6),
        oversightPressure: clamp(s.oversightPressure + 3),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "mascot_campaign",
    category: "Communications",
    name: "Launch Colony Mascot",
    description: "Endearing or ill-advised?",
    tags: ["+Momentum", "+/-Unrest", "+/-Trust"],
    apply: (s) => {
      const log = `Mascot campaign launched. Memes spread across Earth networks.`;
      const rageChange = Math.random() < 0.5 ? -8 : 8;
      const credChange = rageChange < 0 ? 4 : -4;
      return {
        ...s,
        techHype: clamp(s.techHype + 8),
        rage: clamp(s.rage + rageChange),
        cred: clamp(s.cred + credChange),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "earth_broadcast",
    category: "Communications",
    name: "Sponsor Earth Broadcast",
    description: "Over-the-top Earth media event.",
    tags: ["-Reserves", "-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.025);
      const log = `Earth broadcast trends globally. Oversight agencies also notice.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        rage: clamp(s.rage - 10),
        cred: clamp(s.cred + 5),
        techHype: clamp(s.techHype + 10),
        oversightPressure: clamp(s.oversightPressure + 15),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "breakthrough_claim",
    category: "Communications",
    name: "Claim Major Breakthrough",
    description: "Groundbreaking. Verification pending.",
    tags: ["+++Momentum", "+Trust", "+Oversight"],
    apply: (s) => {
      const log = `Breakthrough announced. Investors are ecstatic.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 25),
        cred: clamp(s.cred + 10),
        oversightPressure: clamp(s.oversightPressure + 5),
        tokenPrice: s.tokenPrice * 1.08,
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "infrastructure_announcement",
    category: "Communications",
    name: "Infrastructure Expansion",
    description: "Massive expansion. Details later.",
    tags: ["+Momentum", "±Trust", "-Unrest"],
    apply: (s) => {
      const log = `Infrastructure expansion plans released. Hardware crews are interested.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 12),
        cred: clamp(s.cred + 3),
        rage: clamp(s.rage - 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "terraforming_preview",
    category: "Communications",
    name: "Terraforming Preview",
    description: "Announce first, feasibility later.",
    tags: ["+Momentum", "+++Oversight", "Reserves stable"],
    apply: (s) => {
      const log = `Terraforming preview released. Lawyers seek clarification. Sponsors are requesting private briefings.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 15),
        oversightPressure: clamp(s.oversightPressure + 20),
        cred: clamp(s.cred + 5),
        tokenPrice: s.tokenPrice * 1.05,
        hidden: { ...s.hidden, scrutiny: s.hidden.scrutiny + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "investor_briefing",
    category: "Communications",
    name: "'Major Progress' Briefing",
    description: "'Big things soon.' Classic.",
    tags: ["+Confidence", "-Unrest", "follow-up scrutiny"],
    apply: (s) => {
      const log = `'Major milestones imminent.' Earth confidence surges. The briefing is archived for future reference.`;
      return {
        ...s,
        tokenPrice: s.tokenPrice * 1.06,
        rage: clamp(s.rage - 5),
        cred: clamp(s.cred - 3),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + 0.1 },
        log: [log, ...s.log],
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // CRISIS RESPONSE (formerly Damage Control) - PR and repair
  // ═══════════════════════════════════════════════════════════
  {
    id: "legal_counsel",
    category: "Crisis Response",
    name: "Retain Legal Counsel",
    description: "Top lawyers. Buffer pressure.",
    tags: ["-Reserves", "-Oversight", "+Unrest", "+Trust"],
    defensive: true,
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.02);
      const log = `Legal counsel retained. The bill is... substantial.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        oversightPressure: clamp(s.oversightPressure - 15),
        rage: clamp(s.rage + 4),
        cred: clamp(s.cred + 3),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "official_statement",
    category: "Crisis Response",
    name: "Issue Official Statement",
    description: "Addresses everything and nothing.",
    tags: ["-Unrest", "+Trust", "+Oversight"],
    defensive: true,
    apply: (s) => {
      const log = `Official statement released. Some calm, some mock.`;
      return {
        ...s,
        rage: clamp(s.rage - 6),
        cred: clamp(s.cred + 4),
        oversightPressure: clamp(s.oversightPressure + 4),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "systems_audit",
    category: "Crisis Response",
    name: "Launch Systems Audit",
    description: "Auditors give you clean bill.",
    tags: ["-Reserves", "-Oversight", "+Trust", "-Unrest"],
    defensive: true,
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.015);
      const log = `Systems audit initiative launched.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        oversightPressure: clamp(s.oversightPressure - 12),
        cred: clamp(s.cred + 6),
        rage: clamp(s.rage - 8),
        hidden: {
          ...s.hidden,
          scrutiny: s.hidden.scrutiny + 0.1,
          reserveLiquidity: Math.min(0.6, s.hidden.reserveLiquidity + 0.05),
        },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "counter_narrative",
    category: "Crisis Response",
    name: "Counter-Narrative Campaign",
    description: "It's all misinformation.",
    tags: ["+/-Unrest", "+Oversight", "-Trust"],
    apply: (s) => {
      const log = `Counter-narrative deployed.`;
      const rageChange = Math.random() < 0.5 ? -10 : 12;
      return {
        ...s,
        rage: clamp(s.rage + rageChange),
        oversightPressure: clamp(s.oversightPressure + 6),
        cred: clamp(s.cred - 4),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "reassign_officer",
    category: "Crisis Response",
    name: "Reassign Scapegoat Officer",
    description: "Blame a subordinate.",
    tags: ["-Unrest", "-Trust", "+Oversight"],
    apply: (s) => {
      const log = `Officer reassigned. The crew wants more accountability.`;
      return {
        ...s,
        rage: clamp(s.rage - 8),
        cred: clamp(s.cred - 4),
        oversightPressure: clamp(s.oversightPressure + 6),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "blame_equipment",
    category: "Crisis Response",
    name: "Blame Equipment Failure",
    description: "Faulty systems caused it.",
    tags: ["-Oversight", "-Trust", "+Unrest"],
    apply: (s) => {
      const log = `Equipment failure blamed. Technical team is furious.`;
      return {
        ...s,
        oversightPressure: clamp(s.oversightPressure - 12),
        cred: clamp(s.cred - 8),
        rage: clamp(s.rage + 10),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "feature_not_bug",
    category: "Crisis Response",
    name: "Spin Problem as 'Design Choice'",
    description: "That was intended.",
    tags: ["-Trust", "+Unrest", "-Momentum"],
    apply: (s) => {
      const believed = Math.random() < 0.3;
      const log = believed
        ? `Against all odds, people bought it. 'Operational flexibility feature.'`
        : `Nobody buys it. The jokes write themselves.`;
      return {
        ...s,
        cred: clamp(s.cred + (believed ? 2 : -15)),
        rage: clamp(s.rage + (believed ? -5 : 15)),
        techHype: clamp(s.techHype - 10),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "earth_lobbyist",
    category: "Crisis Response",
    name: "Hire Earth Lobbyist",
    description: "Yes, colonies do this.",
    tags: ["-Unrest", "-Oversight", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.colonyReserves * 0.015);
      const log = `Earth lobbyist deployed. Narrative starting to shift.`;
      return {
        ...s,
        colonyReserves: Math.max(0, s.colonyReserves - cost),
        rage: clamp(s.rage - 12),
        oversightPressure: clamp(s.oversightPressure - 8),
        cred: clamp(s.cred + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "expose_critic",
    category: "Crisis Response",
    name: "Expose a Critic",
    description: "Release their private comms. Nuclear option.",
    tags: ["-Unrest", "-Trust", "+Oversight", "social meltdown"],
    apply: (s) => {
      const backfires = Math.random() < 0.4;
      const log = backfires
        ? `The critic had receipts too. Mutual destruction.`
        : `Critic exposed. They're deleting posts.`;
      return {
        ...s,
        rage: clamp(s.rage + (backfires ? 15 : -15)),
        cred: clamp(s.cred - 10),
        oversightPressure: clamp(s.oversightPressure + 12),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.15 },
        log: [log, ...s.log],
      };
    },
  },

  // ═══════════════════════════════════════════════════════════
  // CREW RELATIONS (formerly Social) - Interpersonal and morale
  // ═══════════════════════════════════════════════════════════
  {
    id: "crew_broadcast",
    category: "Crew Relations",
    name: "Crew-Wide Broadcast",
    description: "Inspire or backfire.",
    tags: ["+/-Trust", "+/-Unrest", "+Momentum"],
    apply: (s) => {
      const log = `Crew broadcast sent. Replies are a mix of support and criticism.`;
      const credChange = Math.random() < 0.5 ? 4 : -6;
      const rageChange = credChange > 0 ? -4 : 6;
      return {
        ...s,
        cred: clamp(s.cred + credChange),
        rage: clamp(s.rage + rageChange),
        techHype: clamp(s.techHype + 4),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "senior_staff_meeting",
    category: "Crew Relations",
    name: "Senior Staff Meeting",
    description: "Wing it.",
    tags: ["+/-Trust", "+/-Unrest", "+/-Momentum"],
    apply: (s) => {
      const success = Math.random() < s.cred / 120;
      const log = success ? `Meeting went well. Leadership is confident.` : `Meeting was a disaster. Clips are circulating.`;
      return {
        ...s,
        cred: clamp(s.cred + (success ? 12 : -18)),
        rage: clamp(s.rage + (success ? -8 : 12)),
        techHype: clamp(s.techHype + (success ? 10 : -4)),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "private_reassurance",
    category: "Crew Relations",
    name: "Private Reassurance",
    description: "Quiet reassurances.",
    tags: ["-Unrest", "+/-Trust", "+/-Momentum", "+Oversight?"],
    apply: (s) => {
      const leak = Math.random() < 0.25;
      const log = leak ? `Reassurances leaked. Embarrassing.` : `Key personnel calmed down (for now).`;
      return {
        ...s,
        rage: clamp(s.rage + (leak ? 20 : -10)),
        oversightPressure: clamp(s.oversightPressure + (leak ? 10 : 0)),
        cred: clamp(s.cred + (leak ? -6 : 5)),
        techHype: clamp(s.techHype + (leak ? -2 : 8)),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + (leak ? 0.1 : 0) },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "recreation_event",
    category: "Crew Relations",
    name: "Recreation Event",
    description: "Morale boost. Visibility cost.",
    tags: ["+Momentum", "-Trust", "+Oversight", "-Stability"],
    apply: (s) => {
      const log = `Recreation event held. Cameras were definitely on.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 6),
        cred: clamp(s.cred - 10),
        oversightPressure: clamp(s.oversightPressure + 15),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "earth_celebrity",
    category: "Crew Relations",
    name: "Call Earth Celebrity",
    description: "Shoot your shot.",
    tags: ["+/-Trust", "+/-Unrest", "+Oversight"],
    apply: (s) => {
      const success = Math.random() < 0.25;
      const log = success ? `Celebrity responds positively. Public support boost.` : `No response. Awkward silence.`;
      return {
        ...s,
        cred: clamp(s.cred + (success ? 18 : -6)),
        rage: clamp(s.rage + (success ? -8 : 4)),
        oversightPressure: clamp(s.oversightPressure + (success ? 6 : 0)),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "morale_event",
    category: "Crew Relations",
    name: "Launch Morale Event",
    description: "Distraction celebration.",
    tags: ["+Reserves", "-Unrest", "+Oversight", "-Trust", "+Momentum"],
    apply: (s) => {
      const inflow = 80;
      const log = `Morale event launched. Excitement spreads.`;
      return {
        ...s,
        colonyReserves: s.colonyReserves + inflow,
        rage: clamp(s.rage - 10),
        oversightPressure: clamp(s.oversightPressure + 10),
        cred: clamp(s.cred - 5),
        techHype: clamp(s.techHype + 15),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "rivalry_challenge",
    category: "Crew Relations",
    name: "Challenge Rival Commander",
    description: "Public dispute with rival leadership.",
    tags: ["±Trust big swing", "++Unrest", "+Momentum"],
    apply: (s) => {
      const won = Math.random() < 0.5;
      const log = won
        ? `You won the public dispute. Rival is humiliated.`
        : `You lost the argument. The transcript circulates.`;
      return {
        ...s,
        cred: clamp(s.cred + (won ? 15 : -20)),
        rage: clamp(s.rage + 12),
        techHype: clamp(s.techHype + 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "progress_display",
    category: "Crew Relations",
    name: "Post Progress Visualization",
    description: "The 'we're early' chart.",
    tags: ["+Momentum", "-Trust", "-Unrest"],
    apply: (s) => {
      const log = `Progress chart posted. Enthusiasts shared it unironically.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 10),
        cred: clamp(s.cred - 5),
        rage: clamp(s.rage - 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "influencer_visit",
    category: "Crew Relations",
    name: "Host Influencer Visit",
    description: "Their audience becomes yours.",
    tags: ["-Trust", "+Momentum", "+Unrest"],
    apply: (s) => {
      const log = `Influencer visit complete. New followers, old crew furious.`;
      return {
        ...s,
        cred: clamp(s.cred - 12),
        techHype: clamp(s.techHype + 15),
        rage: clamp(s.rage + 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "documentary_crew",
    category: "Crew Relations",
    name: "Documentary Interview",
    description: "The establishment media route.",
    tags: ["++Trust", "+Oversight", "-Unrest"],
    apply: (s) => {
      const log = `Documentary interview aired. You almost sounded legitimate.`;
      return {
        ...s,
        cred: clamp(s.cred + 18),
        oversightPressure: clamp(s.oversightPressure + 8),
        rage: clamp(s.rage - 10),
        tokenPrice: s.tokenPrice * 1.03,
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "podcast_interview",
    category: "Crew Relations",
    name: "Podcast Interview",
    description: "Popular show. Host might mock you.",
    tags: ["+Momentum", "-Unrest", "+Earth Confidence"],
    apply: (s) => {
      const mocked = Math.random() < 0.3;
      const log = mocked
        ? `Host challenged you on air. Clips spreading through Earth channels.`
        : `Podcast went well. Credibility established.`;
      return {
        ...s,
        techHype: clamp(s.techHype + (mocked ? -5 : 12)),
        rage: clamp(s.rage + (mocked ? 10 : -8)),
        cred: clamp(s.cred + (mocked ? -10 : 8)),
        tokenPrice: s.tokenPrice * (mocked ? 0.97 : 1.05),
        log: [log, ...s.log],
      };
    },
  },
];

export function getVisibleActions(state: GameState): ActionDef[] {
  return ACTIONS.filter((a) => !a.visibleIf || a.visibleIf(state));
}

// Sample a limited set per category to reduce menu fatigue
export function sampleActionsForTurn(state: GameState, rng: () => number): ActionDef[] {
  const actions = getVisibleActions(state);
  const byCategory: Record<ActionCategory, ActionDef[]> = {
    Ambition: [],
    Command: [],
    Communications: [],
    "Crisis Response": [],
    "Crew Relations": [],
  };
  actions.forEach((a) => byCategory[a.category].push(a));

  const pick = (arr: ActionDef[], count: number) => {
    const copy = [...arr];
    const res: ActionDef[] = [];
    for (let i = 0; i < count && copy.length; i++) {
      const idx = Math.floor(rng() * copy.length);
      res.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return res;
  };

  return [
    ...pick(byCategory.Ambition, 2),
    ...pick(byCategory.Command, 1),
    ...pick(byCategory.Communications, 1),
    ...pick(byCategory["Crisis Response"], 1),
    ...pick(byCategory["Crew Relations"], 1),
  ].filter(Boolean);
}
