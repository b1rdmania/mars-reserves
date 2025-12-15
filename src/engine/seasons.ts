export type SeasonId = "dust_season" | "solar_maximum" | "resupply_window" | "winter_ops";

export interface SeasonDef {
  id: SeasonId;
  name: string;
  description: string;
  // modifiers that influence drift/probabilities
  rageDecayDelta?: number;
  oversightDriftDelta?: number;
  credDecayDelta?: number;
  techHypeDecayDelta?: number;
  crisisFactor?: number;
  eventWeightMods?: Record<string, number>;
}

export const SEASONS: SeasonDef[] = [
  {
    id: "dust_season",
    name: "Dust Storm Season",
    description: "Crew tensions ease as everyone focuses on survival. Equipment stress increases.",
    rageDecayDelta: 1, // cools faster - crew united against external threat
    crisisFactor: 0.9,
    eventWeightMods: {
      dust_storm: 3,
      hab_malfunction: 1.5,
      research_breakthrough: 0.6,
    },
  },
  {
    id: "solar_maximum",
    name: "Solar Maximum",
    description: "Radiation risks increase. Earth scrutiny intensifies.",
    oversightDriftDelta: 3, // more attention from Earth
    crisisFactor: 1.3,
    eventWeightMods: {
      solar_flare: 2.0,
      earth_news_cycle: 1.5,
      supply_ship_delay: 1.2,
    },
  },
  {
    id: "resupply_window",
    name: "Resupply Window",
    description: "Transfer window open. Crew morale drifts as attention turns Earthward.",
    credDecayDelta: 2,
    rageDecayDelta: -2, // no natural decay - crew restless
    techHypeDecayDelta: -1,
    crisisFactor: 1.1,
    eventWeightMods: {
      supply_ship_delay: 1.8,
      crew_morale_boost: 1.4,
    },
  },
  {
    id: "winter_ops",
    name: "Winter Operations",
    description: "Reduced solar power. More research and planning events.",
    techHypeDecayDelta: 1, // research momentum carries
    crisisFactor: 1.1,
    eventWeightMods: {
      research_breakthrough: 1.4,
      water_reclaimer_failure: 1.3,
      hab_malfunction: 1.2,
    },
  },
];

export function getSeason(id: SeasonId | string | undefined): SeasonDef {
  const season = SEASONS.find((s) => s.id === id);
  return season ?? SEASONS[0];
}

