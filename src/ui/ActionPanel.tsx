import React from "react";
import type { GameState } from "../engine/state";
import { ACTIONS, getVisibleActions } from "../engine/actions";
import type { ActionCategory, ActionId } from "../engine/actions";

interface Props {
  state: GameState;
  onSelect: (id: ActionId) => void;
  disabled?: boolean;
}

const CATEGORY_ORDER: ActionCategory[] = ["Siphon", "Governance", "Narrative", "Damage Control", "Social"];

export const ActionPanel: React.FC<Props> = ({ state, onSelect, disabled }) => {
  const actions = state.availableActions.length
    ? ACTIONS.filter((a) => state.availableActions.includes(a.id)).filter(
        (a) => !a.visibleIf || a.visibleIf(state),
      )
    : getVisibleActions(state);
  const byCategory: Record<ActionCategory, typeof actions> = {
    Siphon: [],
    Governance: [],
    Narrative: [],
    "Damage Control": [],
    Social: [],
  };
  actions.forEach((a) => byCategory[a.category].push(a));

  return (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((cat) => {
        const list = byCategory[cat];
        if (!list.length) return null;
        return (
          <div key={cat}>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1 font-mono">{cat}</div>
            <div className="space-y-1.5">
              {list.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  disabled={disabled}
                  className={`w-full text-left rounded-[6px] px-3 py-2 text-[13px] font-mono ${
                    disabled
                      ? "bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800"
                      : "bg-[#12151c] hover:bg-[#171b24] border border-[#1c1f27]"
                  }`}
                >
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-slate-300">{a.description}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

