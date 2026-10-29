import React from 'react';
import { X, RotateCcw, Trash2, History, AlertCircle } from 'lucide-react';

// Pattern: Container / Presentational Pattern
// Pure Presentational Component: renders the prompt history timeline, rollback trigger, and erase prompt actions.
export default function PromptRollbackDrawer({
  isOpen,
  onClose,
  targetType,
  revisions = [],
  currentRevisionId,
  onRollback,
  onErase,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg h-full bg-gray-950 border-l border-gray-800 p-6 flex flex-col space-y-6 overflow-hidden shadow-2xl animate-fadeInRight">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Prompt Revision History</h3>
              <p className="text-xs text-gray-400 font-mono">
                Workflow: {targetType || 'ACTIVE'} • Rollback or Erase Prompts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainability Note */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-xl text-xs text-cyan-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Prompt Rollback & Erase:</strong> If Gemini produced an unwanted result or bug, you can <em>erase</em> the prompt turn to eliminate the bug, or <em>rollback</em> to revert your workspace to an earlier iteration.
          </span>
        </div>

        {/* Revisions List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400">Loading revisions...</div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-500">
              No previous prompt revisions recorded for this section yet.
            </div>
          ) : (
            revisions.map((rev) => {
              const isCurrent = rev.id === currentRevisionId;
              const isRolledBack = rev.status === 'ROLLED_BACK';

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : isRolledBack
                      ? 'bg-gray-900/40 border-gray-800/80 opacity-70'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-gray-800">
                        Rev #{rev.revisionNumber}
                      </span>
                      {isCurrent && (
                        <span className="text-emerald-400 font-medium font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          CURRENT ACTIVE
                        </span>
                      )}
                      {isRolledBack && (
                        <span className="text-amber-400 font-medium font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          ROLLED BACK
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 font-mono text-[11px]">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-mono text-gray-400">Prompt Directive:</span>
                    <p className="text-xs text-gray-300 font-mono bg-black/40 p-2.5 rounded-lg border border-gray-800 line-clamp-3">
                      {rev.promptText || 'Standard system prompt'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-mono text-gray-400">Output Generated:</span>
                    <p className="text-xs text-gray-400 line-clamp-2 italic">
                      {rev.outputText || 'JSON / Letter output'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                    <button
                      onClick={() => onRollback(rev.id)}
                      disabled={isCurrent}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {isCurrent ? 'Active Version' : 'Rollback to This'}
                    </button>

                    <button
                      onClick={() => onErase(rev.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Erase this prompt iteration to remove bugs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Erase Prompt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-semibold text-gray-300 transition-all"
        >
          Close Revision Drawer
        </button>
      </div>
    </div>
  );
}
