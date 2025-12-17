import React from "react";
import type { GameState } from "../engine/state";
import { ACTIONS, getVisibleActions } from "../engine/actions";
import type { ActionCategory, ActionId } from "../engine/actions";

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

// Classification stamps for procedural weight
const CATEGORY_STAMP: Record<ActionCategory, string> = {
  Ambition: "NON-STANDARD",
  Command: "AUTHORIZED",
  Communications: "LOGGED",
  "Crisis Response": "OVERRIDE",
  "Crew Relations": "INFORMAL",
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
        return (
          <div key={cat} className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#5a6475] font-semibold">
                {cat}
              </span>
            </div>
            <div className="space-y-1.5">
              {list.map((a) => {
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
                      {CATEGORY_STAMP[a.category]}
                    </span>

                    <div className="font-medium text-sm leading-tight text-[#c8cdd5] pr-16">
                      {a.name.replace("[Your Name]", state.founderName)}
                    </div>
                    <div className="text-[11px] text-[#5a6475] leading-tight mt-0.5">
                      {a.description}
                    </div>
                    {temptation && (
                      <div className="text-[9px] text-[#d97706]/60 mt-1">
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
