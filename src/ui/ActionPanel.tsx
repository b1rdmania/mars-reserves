import React from "react";
import type { GameState } from "../engine/state";
import { ACTIONS, getVisibleActions } from "../engine/actions";
import type { ActionCategory, ActionId } from "../engine/actions";
import { SYMBOLS, ACTION_SYMBOLS, FILING_CATEGORIES, CLASSIFICATIONS } from "./symbols";

interface Props {
  state: GameState;
  onSelect: (id: ActionId) => void;
  disabled?: boolean;
}

const CATEGORY_ORDER: ActionCategory[] = ["Ambition", "Command", "Communications", "Crisis Response", "Crew Relations"];

// Updated CSS class names for terminal aesthetic
const CATEGORY_CLASS: Record<ActionCategory, string> = {
  Ambition: "ambition",
  Command: "command",
  Communications: "communications",
  "Crisis Response": "crisis-response",
  "Crew Relations": "crew-relations",
};

// Map ActionCategory to symbol key
const CATEGORY_TO_KEY: Record<ActionCategory, string> = {
  Ambition: "ambition",
  Command: "command",
  Communications: "research",
  "Crisis Response": "operations",
  "Crew Relations": "informal",
};

export const ActionPanel: React.FC<Props> = ({ state, onSelect, disabled }) => {
  const actions = state.availableActions.length
    ? ACTIONS.filter((a) => state.availableActions.includes(a.id)).filter(
      (a) => !a.visibleIf || a.visibleIf(state),
    )
    : getVisibleActions(state);

  const byCategory: Record<ActionCategory, typeof actions> = {
    Ambition: [],
    Command: [],
    Communications: [],
    "Crisis Response": [],
    "Crew Relations": [],
  };
  actions.forEach((a) => byCategory[a.category].push(a));

  return (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((cat) => {
        const list = byCategory[cat];
        if (!list.length) return null;
        const catKey = CATEGORY_TO_KEY[cat];
        const catSymbol = ACTION_SYMBOLS[catKey] || SYMBOLS.TIME;
        return (
          <div key={cat} className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{catSymbol}</span>
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#64748b] font-semibold">
                {cat}
              </span>
            </div>
            <div className="space-y-1.5">
              {list.map((a) => {
                const categoryKey = CATEGORY_TO_KEY[a.category];
                const classification = CLASSIFICATIONS[categoryKey] || "LOGGED";
                const filing = FILING_CATEGORIES[categoryKey] || "GENERAL";

                // Temptation sub-lines for Ambition actions (subtle moral pressure)
                const temptationLines = [
                  "No one will question this.",
                  "Oversight won't notice yet.",
                  "This can be justified later.",
                  "Standard procedure, really.",
                  "It's for the mission.",
                ];
                const temptation = cat === "Ambition"
                  ? temptationLines[a.name.length % temptationLines.length]
                  : null;

                return (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a.id)}
                    disabled={disabled}
                    className={`action-btn ${CATEGORY_CLASS[a.category]}`}
                  >
                    {/* Classification stamp */}
                    <span className="action-stamp">
                      {classification}
                    </span>

                    <div className="font-medium text-sm leading-tight text-[#c8cdd5] pr-16">
                      {a.name.replace("[Your Name]", state.founderName)}
                    </div>
                    <div className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                      {a.description}
                    </div>
                    {/* Filing annotation */}
                    <div className="text-[8px] text-[#3a4555] mt-1 uppercase tracking-wide">
                      Filed under: {filing}
                    </div>
                    {temptation && (
                      <div className="text-[9px] text-[#d97706]/50 mt-0.5 italic">
                        {temptation}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
