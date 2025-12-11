import type { GameState } from "./state";

export type ActionCategory = "Siphon" | "Governance" | "Narrative" | "Damage Control" | "Social";

export type ActionId =
  | "siphon_advisory"
  | "strategic_consultants"
  | "founder_wage_increase"
  | "expense_account"
  | "family_office_vehicle"
  | "real_estate_hq"
  | "token_buyback"
  | "foundation_grant"
  | "emergency_emissions_vote"
  | "lp_incentives_adjust"
  | "treasury_diversification"
  | "delegate_program"
  | "freeze_governance"
  | "announce_partnership"
  | "ship_upgrade"
  | "ai_pivot"
  | "publish_thought_paper"
  | "meme_mascot_campaign"
  | "conference_2049"
  | "lawyer_up"
  | "clarification_post"
  | "launch_audit"
  | "fud_counter_thread"
  | "fire_scapegoat"
  | "shitpost_x"
  | "join_influencer_space"
  | "dm_whale"
  | "dubai_nightclub"
  | "reply_vitalik"
  | "meme_coin_launch";

export interface ActionDef {
  id: ActionId;
  category: ActionCategory;
  name: string;
  description: string;
  apply: (state: GameState) => GameState;
  visibleIf?: (state: GameState) => boolean;
  order?: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export const ACTIONS: ActionDef[] = [
  // Siphon
  {
    id: "siphon_advisory",
    category: "Siphon",
    name: "Advisory Retainer",
    description: "Route treasury to a 'strategic advisory' you secretly own.",
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.1);
      const log = `You siphoned ${amount} via advisory retainer.`;
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
    id: "strategic_consultants",
    category: "Siphon",
    name: "Hire Strategic Consultants",
    description: "Shovel funds to friendly 'experts'.",
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.12);
      const log = `You hired consultants for ${amount}. The invoice is very creative.`;
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
    id: "founder_wage_increase",
    category: "Siphon",
    name: "Increase Founder Wages",
    description: "Triple your salary 'to retain leadership talent'.",
    apply: (s) => {
      const amount = 80;
      const log = `You bumped your salary. Some people notice.`;
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
    id: "expense_account",
    category: "Siphon",
    name: "Expand Expense Account",
    description: "Charge hotels, jets, 'strategy dinners'.",
    apply: (s) => {
      const amount = 60;
      const log = `You ran a wave of expenses through the foundation.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - amount),
        siphoned: s.siphoned + Math.floor(amount * 0.5),
        rage: clamp(s.rage + 12),
        heat: clamp(s.heat + 6),
        cred: clamp(s.cred - 4),
        hidden: { ...s.hidden, communityMemory: s.hidden.communityMemory + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "family_office_vehicle",
    category: "Siphon",
    name: "Family Office Vehicle",
    description: "Route treasury into a 'diversification' structure.",
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.25);
      const log = `You routed funds through a family office.`;
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
    id: "real_estate_hq",
    category: "Siphon",
    name: "Buy 'HQ' Villa",
    description: "Purchase a villa as the new 'ecosystem hub'.",
    apply: (s) => {
      const amount = Math.floor(s.officialTreasury * 0.3);
      const log = `You closed on a lavish 'HQ'. The photos leak instantly.`;
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
    id: "token_buyback",
    category: "Siphon",
    name: "Token Buyback Scheme",
    description: "Prop up price while quietly dumping your own stack.",
    apply: (s) => {
      const cost = 120;
      const log = `You initiate a buyback. Charts look better... for now.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        siphoned: s.siphoned + Math.floor(cost * 0.3),
        techHype: clamp(s.techHype + 12),
        heat: clamp(s.heat + 12),
        rage: clamp(s.rage + 6),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.15 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "foundation_grant",
    category: "Siphon",
    name: "Foundation Grant to Yourself",
    description: "Award yourself R&D funds. Innovative.",
    apply: (s) => {
      const amount = 90;
      const log = `You granted yourself a generous R&D stipend.`;
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

  // Governance
  {
    id: "emergency_emissions_vote",
    category: "Governance",
    name: "Emergency Emissions Vote",
    description: "Print more tokens to refill coffers.",
    apply: (s) => {
      const inflow = 300;
      const log = `You force through an emissions vote. Treasury refilled, community seethes.`;
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
    id: "lp_incentives_adjust",
    category: "Governance",
    name: "LP Incentives Adjustment",
    description: "Drown LPs in incentives; hope volume follows.",
    apply: (s) => {
      const cost = 120;
      const log = `You juiced LP incentives. Farmers rejoice; everyone else shrugs.`;
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
    id: "treasury_diversification",
    category: "Governance",
    name: "Treasury Diversification",
    description: "Swap tokens at suspicious execution.",
    apply: (s) => {
      const slip = Math.floor(s.officialTreasury * 0.05);
      const log = `You diversified treasury; slippage whispers start.`;
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
    id: "delegate_program",
    category: "Governance",
    name: "Delegate Program",
    description: "Pay influencers to 'vote responsibly'.",
    apply: (s) => {
      const cost = 70;
      const log = `You launched a delegate program. Delegates are... enthusiastic.`;
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
    id: "freeze_governance",
    category: "Governance",
    name: "Freeze Governance",
    description: "Pause voting 'for safety' before a reveal.",
    apply: (s) => {
      const log = `You froze governance. Forums ignite.`;
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

  // Narrative / Hype
  {
    id: "announce_partnership",
    category: "Narrative",
    name: "Announce Major Partnership",
    description: "Claim a big-name partner; details TBD.",
    apply: (s) => {
      const log = `You announced a partnership. Everyone has questions.`;
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
    id: "ship_upgrade",
    category: "Narrative",
    name: "Ship Tech Upgrade",
    description: "Actually ship something. Calms people down.",
    apply: (s) => {
      const cost = 50;
      const log = `You shipped a scaling upgrade. Twitter is impressed.`;
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
    id: "ai_pivot",
    category: "Narrative",
    name: "Announce AI Pivot",
    description: "Rebrand as an AI + crypto protocol. Of course.",
    apply: (s) => {
      const log = `You pivoted to AI. VCs clap, community is confused.`;
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
    id: "publish_thought_paper",
    category: "Narrative",
    name: "Publish Thought Paper",
    description: "Drop a manifesto about the future of modular chains.",
    apply: (s) => {
      const log = `You published a thought piece. Anons argue for 48 hours.`;
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
    id: "meme_mascot_campaign",
    category: "Narrative",
    name: "Launch Meme Mascot",
    description: "Roll out a mascot; hope it's endearing not cringe.",
    apply: (s) => {
      const log = `You launched a mascot campaign. Memes fly.`;
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
    id: "conference_2049",
    category: "Narrative",
    name: "Sponsor Token2049 Party",
    description: "Blow cash on an over-the-top conference activation.",
    apply: (s) => {
      const cost = 100;
      const log = `Your Token2049 party trends on X. Regulators also notice.`;
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

  // Damage Control / PR
  {
    id: "lawyer_up",
    category: "Damage Control",
    name: "Lawyer Up",
    description: "Hire top lawyers to buffer incoming heat.",
    apply: (s) => {
      const cost = 120;
      const log = `You lawyerd up. The bill is... inspiring.`;
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
    id: "clarification_post",
    category: "Damage Control",
    name: "Issue Clarification Post",
    description: "Medium article that solves nothing.",
    apply: (s) => {
      const log = `You posted a clarification. Some calm, some mock.`;
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
    id: "launch_audit",
    category: "Damage Control",
    name: "Launch Audit Initiative",
    description: "Pay auditors to give you a clean bill of health.",
    apply: (s) => {
      const cost = 90;
      const log = `You launched an audit initiative.`;
      return {
        ...s,
        officialTreasury: Math.max(0, s.officialTreasury - cost),
        heat: clamp(s.heat - 12),
        cred: clamp(s.cred + 6),
        rage: clamp(s.rage - 8),
        hidden: { ...s.hidden, auditRisk: s.hidden.auditRisk + 0.1 },
        log: [log, ...s.log],
      };
    },
  },
  {
    id: "fud_counter_thread",
    category: "Damage Control",
    name: "Post 'FUD' Counter-Thread",
    description: "Declare everything is FUD; hope it sticks.",
    apply: (s) => {
      const log = `You posted a FUD counter-thread.`;
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
    id: "fire_scapegoat",
    category: "Damage Control",
    name: "Fire Scapegoat",
    description: "Blame and sack a contractor.",
    apply: (s) => {
      const log = `You fired a scapegoat. The mob wants more.`;
      return {
        ...s,
        rage: clamp(s.rage - 8),
        cred: clamp(s.cred - 4),
        heat: clamp(s.heat + 6),
        log: [log, ...s.log],
      };
    },
  },

  // Social / Degen
  {
    id: "shitpost_x",
    category: "Social",
    name: "Shitpost on X",
    description: "Post a spicy meme. Could backfire.",
    apply: (s) => {
      const log = `You shitposted. Replies are a warzone.`;
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
    id: "join_influencer_space",
    category: "Social",
    name: "Join Influencer Space",
    description: "Hop into a live space and wing it.",
    apply: (s) => {
      const success = Math.random() < s.cred / 120;
      const log = success ? `You crushed the Space. Clips are glowing.` : `You fumbled the Space. Clips go viral badly.`;
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
    id: "dm_whale",
    category: "Social",
    name: "DM a Whale",
    description: "Whisper reassurances to a big holder.",
    apply: (s) => {
      const leak = Math.random() < 0.25;
      const log = leak ? `Whale leaks your DMs. Embarrassing.` : `Whale calms down and stops dumping (for now).`;
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
    id: "dubai_nightclub",
    category: "Social",
    name: "Dubai Nightclub 'Networking'",
    description: "Show face at the most notorious party.",
    apply: (s) => {
      const log = `You hit a Dubai nightclub. Cameras were definitely on.`;
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
    id: "reply_vitalik",
    category: "Social",
    name: "Reply to Vitalik",
    description: "Shoot your shot in Vitalik's replies.",
    apply: (s) => {
      const success = Math.random() < 0.25;
      const log = success ? `Vitalik notices you. Clout ++.` : `No reply. Awkward silence.`;
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
    id: "meme_coin_launch",
    category: "Social",
    name: "Launch Meme Coin",
    description: "Spin up a meme token to distract the masses.",
    apply: (s) => {
      const inflow = 80;
      const log = `You launched a meme coin. Degens swarm.`;
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
];

export function getVisibleActions(state: GameState): ActionDef[] {
  return ACTIONS.filter((a) => !a.visibleIf || a.visibleIf(state));
}

// Sample a limited set per category to reduce menu fatigue
export function sampleActionsForTurn(state: GameState, rng: () => number): ActionDef[] {
  const actions = getVisibleActions(state);
  const byCategory: Record<ActionCategory, ActionDef[]> = {
    Siphon: [],
    Governance: [],
    Narrative: [],
    "Damage Control": [],
    Social: [],
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
    ...pick(byCategory.Siphon, 2),
    ...pick(byCategory.Governance, 1),
    ...pick(byCategory.Narrative, 1),
    ...pick(byCategory["Damage Control"], 1),
    ...pick(byCategory.Social, 1),
  ].filter(Boolean);
}

