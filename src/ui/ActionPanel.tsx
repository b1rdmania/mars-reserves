import React from "react";
import type { GameState } from "../engine/state";
import { ACTIONS, getVisibleActions } from "../engine/actions";
import type { ActionCategory, ActionId } from "../engine/actions";
import { SYMBOLS, ACTION_SYMBOLS, CLASSIFICATIONS } from "./symbols";

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
