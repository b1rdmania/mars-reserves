import type { SeasonDef } from "../engine/seasons";

// V1 Mars seasons - aligns with engine season fields for quick swapping/balancing.
export const SEASONS_V1: SeasonDef[] = [
  {
    id: "dust_season",
    name: "Dust Storm Season",
    description: "Crew tensions ease as everyone focuses on survival. Equipment stress increases.",
    rageDecayDelta: 1,
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
    heatDriftDelta: 3,
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
    rageDecayDelta: -2,
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
    techHypeDecayDelta: 1,
    crisisFactor: 1.1,
    eventWeightMods: {
      research_breakthrough: 1.4,
      water_reclaimer_failure: 1.3,
      hab_malfunction: 1.2,
    },
  },
];
