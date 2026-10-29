// Pattern: State Reducer Pattern
// Encapsulates complex state transitions for prompt versions, undo/redo rollback, and prompt erasing.

export const initialPromptHistoryState = {
  revisions: [],
  currentRevisionId: null,
  activePromptDraft: '',
  historyLoading: false,
  error: null,
};

export const PROMPT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_REVISIONS: 'SET_REVISIONS',
  ADD_REVISION: 'ADD_REVISION',
  ROLLBACK_TO: 'ROLLBACK_TO',
  ERASE_REVISION: 'ERASE_REVISION',
  SET_DRAFT: 'SET_DRAFT',
  SET_ERROR: 'SET_ERROR',
};

export function promptHistoryReducer(state, action) {
  switch (action.type) {
    case PROMPT_ACTIONS.SET_LOADING:
      return {
        ...state,
        historyLoading: action.payload,
      };

    case PROMPT_ACTIONS.SET_REVISIONS:
      return {
        ...state,
        revisions: action.payload,
        currentRevisionId: action.payload.length > 0 ? action.payload[0].id : null,
        historyLoading: false,
        error: null,
      };

    case PROMPT_ACTIONS.ADD_REVISION:
      return {
        ...state,
        revisions: [action.payload, ...state.revisions],
        currentRevisionId: action.payload.id,
        activePromptDraft: '',
        error: null,
      };

    case PROMPT_ACTIONS.ROLLBACK_TO: {
      const targetId = action.payload;
      const target = state.revisions.find((r) => r.id === targetId);
      if (!target) return state;

      const updated = state.revisions.map((rev) => {
        if (rev.revisionNumber > target.revisionNumber && rev.status === 'ACTIVE') {
          return { ...rev, status: 'ROLLED_BACK' };
        }
        if (rev.id === targetId) {
          return { ...rev, status: 'ACTIVE' };
        }
        return rev;
      });

      return {
        ...state,
        revisions: updated,
        currentRevisionId: targetId,
        activePromptDraft: target.promptText || '',
        error: null,
      };
    }

    case PROMPT_ACTIONS.ERASE_REVISION: {
      const revisionIdToErase = action.payload;
      const filtered = state.revisions.filter((r) => r.id !== revisionIdToErase);
      const nextActiveId =
        state.currentRevisionId === revisionIdToErase
          ? filtered.length > 0 ? filtered[0].id : null
          : state.currentRevisionId;

      return {
        ...state,
        revisions: filtered,
        currentRevisionId: nextActiveId,
        error: null,
      };
    }

    case PROMPT_ACTIONS.SET_DRAFT:
      return {
        ...state,
        activePromptDraft: action.payload,
      };

    case PROMPT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        historyLoading: false,
      };

    default:
      return state;
  }
}
