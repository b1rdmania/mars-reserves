import type { GameState } from "./state";

export type ActionCategory = "Extraction" | "Command" | "Communications" | "Crisis Response" | "Crew Relations";

export type ActionId =
  // Extraction (formerly Siphon)
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
  // EXTRACTION (formerly Siphon) - Resource extraction actions
  // ═══════════════════════════════════════════════════════════
  {
    id: "mining_acceleration",
    category: "Extraction",
    name: "Accelerated Mining Operations",
    description: "Push extraction beyond safe limits. Legacy grows, but risks accumulate.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.1);
      const log = `Accelerated mining extracted ${amount} in legacy value.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + 10),
        heat: clamp(s.heat + 5),
        cred: clamp(s.cred - 5),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "external_contractors",
    category: "Extraction",
    name: "Hire External Contractors",
    description: "Bring in 'specialists' with creative accounting.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.12);
      const log = `External contractors processed ${amount}. Invoices are... flexible.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + Math.floor(amount * 0.5),
        rage: clamp(s.rage + 12),
        heat: clamp(s.heat + 8),
        cred: clamp(s.cred - 6),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "commander_bonus",
    category: "Extraction",
    name: "Commander Performance Bonus",
    description: "Award yourself hazard pay. For 'leadership under pressure'.",
    tags: ["+Legacy", "+Unrest", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.05);
      const log = `Commander bonus approved. Crew notices the allocation.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + 20),
        cred: clamp(s.cred - 10),
        heat: clamp(s.heat + 5),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.1, founderStability: s.hidden.founderStability - 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "discretionary_budget",
    category: "Extraction",
    name: "Expand Discretionary Budget",
    description: "Personal quarters upgrades, 'morale supplies', transport privileges.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.06);
      const log = `Discretionary spending approved across multiple line items.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + Math.floor(amount * 0.8),
        rage: clamp(s.rage + 12),
        heat: clamp(s.heat + 6),
        cred: clamp(s.cred - 4),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "private_reserve",
    category: "Extraction",
    name: "Private Reserve Fund",
    description: "Route resources to a 'contingency' fund only you control.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.25);
      const log = `Private reserve fund established. Substantial allocation.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + Math.floor(amount * 0.6),
        rage: clamp(s.rage + 18),
        heat: clamp(s.heat + 15),
        cred: clamp(s.cred - 8),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "luxury_habitat",
    category: "Extraction",
    name: "Construct Luxury Habitat",
    description: "Build a 'command center' that looks suspiciously like a mansion.",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.3);
      const log = `Luxury habitat construction complete. Photos circulate on Earth.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + Math.floor(amount * 0.5),
        rage: clamp(s.rage + 25),
        heat: clamp(s.heat + 12),
        cred: clamp(s.cred - 12),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.25, communityMemory: s.hidden.communityMemory + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "resource_speculation",
    category: "Extraction",
    name: "Resource Speculation",
    description: "Manipulate resource valuations while skimming the difference.",
    tags: ["+Legacy", "+Momentum", "+Oversight", "+Unrest", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.08);
      const log = `Resource speculation initiated. Numbers look good... for now.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        siphoned: s.siphoned + Math.floor(cost * 0.4),
        techHype: clamp(s.techHype + 12),
        heat: clamp(s.heat + 12),
        rage: clamp(s.rage + 6),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "research_grant",
    category: "Extraction",
    name: "Research Grant to Self",
    description: "Award yourself research funds. For 'critical investigation'.",
    tags: ["+Legacy", "+Oversight", "+Unrest", "-Trust", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.07);
      const log = `Research grant approved. You are the sole recipient.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + 15),
        heat: clamp(s.heat + 10),
        cred: clamp(s.cred - 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "emergency_reserves",
    category: "Extraction",
    name: "Tap Emergency Reserves",
    description: "Raid the colony's emergency fund. It's for emergencies, right?",
    tags: ["+Legacy", "+Unrest", "+Oversight", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.15);
      const log = `Emergency reserves accessed. 'Protocol override.'`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + 12),
        heat: clamp(s.heat + 10),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "private_shipment",
    category: "Extraction",
    name: "Private Earth Shipment",
    description: "Send 'samples' to Earth via unofficial channels.",
    tags: ["+Legacy", "+Oversight", "-Reserves"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.08);
      const log = `Private shipment dispatched. Value extraction in progress.`;
      return {
        ...s,
        siphoned: s.siphoned + amount,
        tokenPrice: s.tokenPrice * 0.9,
        heat: clamp(s.heat + 15),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "early_extraction",
    category: "Extraction",
    name: "Accelerate Extraction Schedule",
    description: "Push timelines forward 'for operational needs.' Classic.",
    tags: ["+Legacy", "+++Unrest", "+Oversight"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.2);
      const log = `Extraction accelerated. Crew notices immediately.`;
      return {
        ...s,
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + 25),
        heat: clamp(s.heat + 8),
        cred: clamp(s.cred - 15),
        tokenPrice: s.tokenPrice * 0.85,
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "automated_skimming",
    category: "Extraction",
    name: "Automated Resource Skimming",
    description: "Set up systems that subtly redirect small amounts. Plausible deniability.",
    tags: ["+Legacy gradual", "+Oversight if discovered"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * (0.03 + Math.random() * 0.03));
      const discovered = Math.random() < 0.3;
      const log = discovered
        ? `Automated skimming detected by audit systems. Investigation beginning.`
        : `Automated resource allocation operational. Passive extraction engaged.`;
      return {
        ...s,
        siphoned: s.siphoned + amount,
        rage: clamp(s.rage + (discovered ? 20 : 0)),
        heat: clamp(s.heat + (discovered ? 15 : 3)),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + (discovered ? 0.25 : 0.05) },
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
    description: "Impose rationing to refill reserves. Crew won't be happy.",
    tags: ["+Reserves", "+Unrest", "-Trust", "+Oversight"],
    apply: (s) => {
      const inflow = 300;
      const log = `Emergency rationing implemented. Reserves restored, crew seethes.`;
      return {
        ...s,
        officialTreasury: s.officialTreasury + inflow,
        rage: clamp(s.rage + 25),
        cred: clamp(s.cred - 15),
        heat: clamp(s.heat + 10),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "work_incentives",
    category: "Command",
    name: "Work Incentive Adjustment",
    description: "Restructure incentives. Some benefit, most don't.",
    tags: ["-Reserves", "+Momentum", "+/-Unrest", "-Trust"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.02);
      const log = `Work incentives restructured. Mixed response from crew.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
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
    description: "Redistribute supplies with suspicious efficiency losses.",
    tags: ["-Reserves", "+Oversight", "-Trust", "+Legacy"],
    apply: (s) => {
      const slip = Math.floor(s.officialTreasury * 0.05);
      const log = `Resources reallocated. Some went missing in the process.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - slip),
        siphoned: s.siphoned + Math.floor(slip * 0.2),
        cred: clamp(s.cred - 6),
        heat: clamp(s.heat + 8),
        rage: clamp(s.rage + 6),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "delegate_authority",
    category: "Command",
    name: "Delegate Authority Program",
    description: "Appoint loyal deputies to 'share responsibility'.",
    tags: ["-Reserves", "-Unrest", "+Trust", "+Oversight"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.015);
      const log = `Authority delegation program launched. Deputies are... reliable.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        rage: clamp(s.rage - 8),
        heat: clamp(s.heat + 6),
        cred: clamp(s.cred + 4),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "suspend_protocols",
    category: "Command",
    name: "Suspend Standard Protocols",
    description: "Pause normal procedures 'for operational efficiency'.",
    tags: ["+Unrest", "+Oversight", "-Trust"],
    apply: (s) => {
      const log = `Protocols suspended. Crew forums ignite with complaints.`;
      return {
        ...s,
        rage: clamp(s.rage + 18),
        heat: clamp(s.heat + 8),
        cred: clamp(s.cred - 8),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "crew_assembly",
    category: "Command",
    name: "Crew Assembly (Scripted)",
    description: "Hold an assembly with pre-selected speakers. Looks democratic.",
    tags: ["+Trust", "-Unrest", "+Oversight"],
    apply: (s) => {
      const log = `Assembly went smoothly. Nobody noticed the speaker list was curated.`;
      return {
        ...s,
        cred: clamp(s.cred + 8),
        rage: clamp(s.rage - 10),
        heat: clamp(s.heat + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "night_directive",
    category: "Command",
    name: "Late Night Directive",
    description: "Push through orders when most crew is in sleep cycle.",
    tags: ["+Reserves", "++Unrest next cycle", "-Trust"],
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.02);
      const log = `Directive issued during sleep cycle. Crew waking up unhappy.`;
      return {
        ...s,
        officialTreasury: s.officialTreasury + amount,
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
    description: "Submit a proposal written by AI at 2am. Hope nobody reads it.",
    tags: ["±Trust", "±Momentum", "-Unrest minor"],
    apply: (s) => {
      const quality = Math.random();
      const log = quality > 0.5
        ? `AI proposal is coherent. Some are impressed.`
        : `AI proposal is gibberish. Screenshots everywhere.`;
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
    description: "Claim a big-name partner; details TBD.",
    tags: ["+Momentum", "+Trust", "-Unrest", "+Oversight"],
    apply: (s) => {
      const log = `Partnership announced. Earth has questions but excitement builds.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 15),
        cred: clamp(s.cred + 8),
        rage: clamp(s.rage - 8),
        heat: clamp(s.heat + 8),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "tech_milestone",
    category: "Communications",
    name: "Ship Tech Milestone",
    description: "Actually deliver something. Calms people down.",
    tags: ["-Unrest", "+Trust", "+Momentum", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.02);
      const log = `Technical milestone achieved. Communications channels are impressed.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
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
    description: "Rebrand as a terraforming initiative. Bold move.",
    tags: ["-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const log = `Mission pivot announced. Earth investors applaud, crew is confused.`;
      return {
        ...s,
        rage: clamp(s.rage - 5),
        cred: clamp(s.cred + 5),
        techHype: clamp(s.techHype + 15),
        heat: clamp(s.heat + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "publish_findings",
    category: "Communications",
    name: "Publish Research Findings",
    description: "Release a paper about the future of Mars colonization.",
    tags: ["-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const log = `Research published. Academics argue for 48 hours.`;
      return {
        ...s,
        cred: clamp(s.cred + 6),
        rage: clamp(s.rage - 6),
        techHype: clamp(s.techHype + 6),
        heat: clamp(s.heat + 3),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "mascot_campaign",
    category: "Communications",
    name: "Launch Colony Mascot",
    description: "Roll out a mascot; hope it's endearing not cringe.",
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
    description: "Fund an over-the-top media event on Earth.",
    tags: ["-Reserves", "-Unrest", "+Trust", "+Momentum", "+Oversight"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.025);
      const log = `Earth broadcast trends globally. Oversight agencies also notice.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        rage: clamp(s.rage - 10),
        cred: clamp(s.cred + 5),
        techHype: clamp(s.techHype + 10),
        heat: clamp(s.heat + 15),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.05 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "breakthrough_claim",
    category: "Communications",
    name: "Claim Major Breakthrough",
    description: "Announce something groundbreaking. Verification pending.",
    tags: ["+++Momentum", "+Trust", "+Oversight"],
    apply: (s) => {
      const log = `Breakthrough announced. Investors are ecstatic.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 25),
        cred: clamp(s.cred + 10),
        heat: clamp(s.heat + 5),
        tokenPrice: s.tokenPrice * 1.08,
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "infrastructure_announcement",
    category: "Communications",
    name: "Infrastructure Expansion",
    description: "Announce massive expansion plans. Details to follow.",
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
    description: "Release visionary plans. Announce first, figure out feasibility later.",
    tags: ["+Momentum", "+++Oversight", "Reserves stable"],
    apply: (s) => {
      const log = `Terraforming preview released. Lawyers are sweating. Investors are DMing.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 15),
        heat: clamp(s.heat + 20),
        cred: clamp(s.cred + 5),
        tokenPrice: s.tokenPrice * 1.05,
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "investor_briefing",
    category: "Communications",
    name: "'Major Progress' Briefing",
    description: "Promise big things coming soon. Classic hype narrative.",
    tags: ["+Price", "-Unrest", "follow-up scrutiny"],
    apply: (s) => {
      const log = `'Major milestones imminent.' Mission value pumps. Earth screenshots this for later.`;
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
    description: "Hire top lawyers to buffer incoming pressure.",
    tags: ["-Reserves", "-Oversight", "+Unrest", "+Trust"],
    defensive: true,
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.02);
      const log = `Legal counsel retained. The bill is... substantial.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        heat: clamp(s.heat - 15),
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
    description: "Release a statement that addresses everything and nothing.",
    tags: ["-Unrest", "+Trust", "+Oversight"],
    defensive: true,
    apply: (s) => {
      const log = `Official statement released. Some calm, some mock.`;
      return {
        ...s,
        rage: clamp(s.rage - 6),
        cred: clamp(s.cred + 4),
        heat: clamp(s.heat + 4),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "systems_audit",
    category: "Crisis Response",
    name: "Launch Systems Audit",
    description: "Hire auditors to give you a clean bill of health.",
    tags: ["-Reserves", "-Oversight", "+Trust", "-Unrest"],
    defensive: true,
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.015);
      const log = `Systems audit initiative launched.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        heat: clamp(s.heat - 12),
        cred: clamp(s.cred + 6),
        rage: clamp(s.rage - 8),
        hidden: {
          ...s.hidden,
          auditRisk: s.hidden.auditRisk + 0.1,
          stablecoinRatio: Math.min(0.6, s.hidden.stablecoinRatio + 0.05),
        },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "counter_narrative",
    category: "Crisis Response",
    name: "Counter-Narrative Campaign",
    description: "Declare everything is misinformation; hope it sticks.",
    tags: ["+/-Unrest", "+Oversight", "-Trust"],
    apply: (s) => {
      const log = `Counter-narrative deployed.`;
      const rageChange = Math.random() < 0.5 ? -10 : 12;
      return {
        ...s,
        rage: clamp(s.rage + rageChange),
        heat: clamp(s.heat + 6),
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
    description: "Blame and demote a subordinate.",
    tags: ["-Unrest", "-Trust", "+Oversight"],
    apply: (s) => {
      const log = `Officer reassigned. The crew wants more accountability.`;
      return {
        ...s,
        rage: clamp(s.rage - 8),
        cred: clamp(s.cred - 4),
        heat: clamp(s.heat + 6),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "blame_equipment",
    category: "Crisis Response",
    name: "Blame Equipment Failure",
    description: "Claim problems were caused by faulty systems.",
    tags: ["-Oversight", "-Trust", "+Unrest"],
    apply: (s) => {
      const log = `Equipment failure blamed. Technical team is furious.`;
      return {
        ...s,
        heat: clamp(s.heat - 12),
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
    description: "The 'that's actually intended' play.",
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
    description: "Yes, this is a real thing colony commanders do.",
    tags: ["-Unrest", "-Oversight", "-Reserves"],
    apply: (s) => {
      const cost = Math.floor(s.officialTreasury * 0.015);
      const log = `Earth lobbyist deployed. Narrative starting to shift.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        rage: clamp(s.rage - 12),
        heat: clamp(s.heat - 8),
        cred: clamp(s.cred + 5),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "expose_critic",
    category: "Crisis Response",
    name: "Expose a Critic",
    description: "Publicly release private communications from a detractor. Nuclear option.",
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
        heat: clamp(s.heat + 12),
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
    description: "Post a message to all crew. Could inspire or backfire.",
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
    description: "Hop into a meeting and wing it.",
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
    description: "Whisper reassurances to key personnel.",
    tags: ["-Unrest", "+/-Trust", "+/-Momentum", "+Oversight?"],
    apply: (s) => {
      const leak = Math.random() < 0.25;
      const log = leak ? `Reassurances leaked. Embarrassing.` : `Key personnel calmed down (for now).`;
      return {
        ...s,
        rage: clamp(s.rage + (leak ? 20 : -10)),
        heat: clamp(s.heat + (leak ? 10 : 0)),
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
    description: "Organize an event. Morale boost with visibility costs.",
    tags: ["+Momentum", "-Trust", "+Oversight", "-Stability"],
    apply: (s) => {
      const log = `Recreation event held. Cameras were definitely on.`;
      return {
        ...s,
        techHype: clamp(s.techHype + 6),
        cred: clamp(s.cred - 10),
        heat: clamp(s.heat + 15),
        hidden: { ...s.hidden, founderStability: s.hidden.founderStability - 0.2 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "earth_celebrity",
    category: "Crew Relations",
    name: "Call Earth Celebrity",
    description: "Shoot your shot with a famous Earth supporter.",
    tags: ["+/-Trust", "+/-Unrest", "+Oversight"],
    apply: (s) => {
      const success = Math.random() < 0.25;
      const log = success ? `Celebrity responds positively. Clout boost!` : `No response. Awkward silence.`;
      return {
        ...s,
        cred: clamp(s.cred + (success ? 18 : -6)),
        rage: clamp(s.rage + (success ? -8 : 4)),
        heat: clamp(s.heat + (success ? 6 : 0)),
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "morale_event",
    category: "Crew Relations",
    name: "Launch Morale Event",
    description: "Spin up a celebration to distract the crew.",
    tags: ["+Reserves", "-Unrest", "+Oversight", "-Trust", "+Momentum"],
    apply: (s) => {
      const inflow = 80;
      const log = `Morale event launched. Excitement spreads.`;
      return {
        ...s,
        officialTreasury: s.officialTreasury + inflow,
        rage: clamp(s.rage - 10),
        heat: clamp(s.heat + 10),
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
    description: "Start a public dispute with another colony's leadership.",
    tags: ["±Trust big swing", "++Unrest", "+Momentum"],
    apply: (s) => {
      const won = Math.random() < 0.5;
      const log = won
        ? `You won the public dispute. Rival is humiliated.`
        : `You lost the argument. Screenshots everywhere.`;
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
    description: "The classic 'we're early' chart. Works every time.",
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
    description: "Bring in a known promoter. Their audience becomes yours.",
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
    description: "The establishment media route. Credibility pump incoming.",
    tags: ["++Trust", "+Oversight", "-Unrest"],
    apply: (s) => {
      const log = `Documentary interview aired. You almost sounded legitimate.`;
      return {
        ...s,
        cred: clamp(s.cred + 18),
        heat: clamp(s.heat + 8),
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
    description: "Join a popular show. Host might mock you.",
    tags: ["+Momentum", "-Unrest", "+Price spike"],
    apply: (s) => {
      const mocked = Math.random() < 0.3;
      const log = mocked
        ? `Host roasted you live. Clips going everywhere.`
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
    Extraction: [],
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
    ...pick(byCategory.Extraction, 2),
    ...pick(byCategory.Command, 1),
    ...pick(byCategory.Communications, 1),
    ...pick(byCategory["Crisis Response"], 1),
    ...pick(byCategory["Crew Relations"], 1),
  ].filter(Boolean);
}
