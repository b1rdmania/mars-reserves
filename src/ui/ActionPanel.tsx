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

const CATEGORY_CLASS: Record<ActionCategory, string> = {
  Ambition: "ambition",
  Command: "governance",
  Communications: "narrative",
  "Crisis Response": "damage",
  "Crew Relations": "social",
};

const CATEGORY_ICON: Record<ActionCategory, string> = {
  Ambition: "🏛️",
  Command: "📋",
  Communications: "📡",
  "Crisis Response": "🛡️",
  "Crew Relations": "👥",
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
    <div className="space-y-4 animate-slideUp">
      {CATEGORY_ORDER.map((cat) => {
        const list = byCategory[cat];
        if (!list.length) return null;
        return (
          <div key={cat} className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{CATEGORY_ICON[cat]}</span>
              <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                {cat}
              </span>
            </div>
            <div className="space-y-2">
              {list.map((a) => {
                // Temptation sub-lines for Ambition actions only (Game Boy-style moral pressure)
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
                    <div className="font-semibold text-sm leading-tight text-slate-100">
                      {a.name}
                    </div>
                    <div className="text-xs text-slate-400 leading-tight mt-1">
                      {a.description}
                    </div>
                    {temptation && (
                      <div className="text-[10px] text-amber-500/70 italic mt-1">
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
