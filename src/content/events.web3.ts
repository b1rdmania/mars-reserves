import type { EventDef } from "../engine/events";

// Mars colony incidents - hard sci-fi grounded with subtle dark humor
// Tone: Briefing notes, log entries, dry internal memos
export const WEB3_EVENTS: EventDef[] = [];

// Mars incident fragments for narrative generators
export interface ScandalFragment {
  key: string;
  narrative: string;
  severity?: "low" | "medium" | "high" | "very high" | "extreme";
}

export const SCANDAL_FRAGMENTS: ScandalFragment[] = [
  {
    key: "supply_manifest_discrepancy",
    severity: "medium",
    narrative:
      "An audit flagged discrepancies between logged supplies and physical inventory. Earth is asking pointed questions about 'evaporative losses' in sealed containers.",
  },
  {
    key: "crew_anonymous_complaint",
    severity: "high",
    narrative:
      "Anonymous crew complaints reached Mission Control before you could review them. The tone of your next briefing was noticeably colder.",
  },
  {
    key: "equipment_failure_coverup",
    severity: "very high",
    narrative:
      "Maintenance logs show you classified a life support anomaly as 'routine' three weeks before the incident. The crew found out. So did Earth.",
  },
  {
    key: "personal_quarters_expansion",
    severity: "medium",
    narrative:
      "Someone noticed your quarters are 40% larger than regulation spec. The 'efficiency optimization' justification isn't landing well in the mess hall.",
  },
  {
    key: "contractor_favoritism",
    severity: "high",
    narrative:
      "Internal memos suggest you prioritized equipment from a contractor with personal connections. You called it 'supply chain optimization.' Others called it something else.",
  },
  {
    key: "comms_delay_exploitation",
    severity: "medium",
    narrative:
      "You used the 22-minute comms delay to approve three questionable requisitions before Earth could respond. They noticed the timestamps.",
  },
  {
    key: "crew_rotation_manipulation",
    severity: "high",
    narrative:
      "The crew rotation schedule was adjusted to send your loudest critic back to Earth early. The official reason was 'medical precaution.' Nobody believed it.",
  },
  {
    key: "resource_reallocation_leak",
    severity: "very high",
    narrative:
      "Internal resource allocation models leaked to the crew. They now know exactly how much goes to 'contingency reserves' versus operations.",
  },
  {
    key: "hab_expansion_priorities",
    severity: "medium",
    narrative:
      "The habitat expansion prioritized command quarters over crew facilities. The blueprints circulated before you could explain the 'operational necessity.'",
  },
  {
    key: "earth_liaison_conflict",
    severity: "high",
    narrative:
      "Your Earth liaison filed a formal concern about 'communication gaps.' Translation: they think you're hiding something. They're not entirely wrong.",
  },
  {
    key: "maintenance_deferral_chain",
    severity: "extreme",
    narrative:
      "A maintenance deferral you signed off on led to a cascade failure. The incident report traces directly back to your authorization.",
  },
  {
    key: "supply_priority_scandal",
    severity: "high",
    narrative:
      "Luxury items appeared in your personal manifest while essential crew supplies were marked 'delayed.' Someone compared the shipping records.",
  },
  {
    key: "morale_report_manipulation",
    severity: "medium",
    narrative:
      "Crew morale surveys were 'adjusted for statistical accuracy' before transmission to Earth. The original responses somehow leaked anyway.",
  },
  {
    key: "emergency_drill_timing",
    severity: "low",
    narrative:
      "You scheduled an emergency drill during the crew's only rest period. It was technically regulation. It was also technically a power move.",
  },
  {
    key: "mission_log_redactions",
    severity: "extreme",
    narrative:
      "Routine log audits revealed extensive redactions in the official mission record. Earth has requested the unedited versions. You're still 'locating' them.",
  },
];
