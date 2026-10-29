import { useReducer, useCallback, useEffect } from 'react';
import { promptsApi } from './promptsApi';
import {
  promptHistoryReducer,
  initialPromptHistoryState,
  PROMPT_ACTIONS,
} from './promptHistoryReducer';

// Pattern: Custom Hooks Pattern
// Encapsulates prompt history, rollback, and erase functionality with backend synchronization.
export function usePromptHistory(targetType) {
  const [state, dispatch] = useReducer(promptHistoryReducer, initialPromptHistoryState);

  const fetchHistory = useCallback(async () => {
    if (!targetType) return;
    dispatch({ type: PROMPT_ACTIONS.SET_LOADING, payload: true });
    try {
      const history = await promptsApi.getPromptHistory(targetType);
      dispatch({ type: PROMPT_ACTIONS.SET_REVISIONS, payload: history });
    } catch (err) {
      dispatch({ type: PROMPT_ACTIONS.SET_ERROR, payload: err.message || 'Failed to load history' });
    }
  }, [targetType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const rollback = useCallback(
    async (targetRevisionId) => {
      dispatch({ type: PROMPT_ACTIONS.SET_LOADING, payload: true });
      try {
        const rolledBackRevision = await promptsApi.rollbackPrompt(targetType, targetRevisionId);
        dispatch({ type: PROMPT_ACTIONS.ROLLBACK_TO, payload: targetRevisionId });
        return rolledBackRevision;
      } catch (err) {
        dispatch({ type: PROMPT_ACTIONS.SET_ERROR, payload: err.message || 'Failed to rollback' });
        throw err;
      } finally {
        dispatch({ type: PROMPT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    [targetType]
  );

  const erase = useCallback(async (revisionId) => {
    dispatch({ type: PROMPT_ACTIONS.SET_LOADING, payload: true });
    try {
      await promptsApi.erasePrompt(revisionId);
      dispatch({ type: PROMPT_ACTIONS.ERASE_REVISION, payload: revisionId });
    } catch (err) {
      dispatch({ type: PROMPT_ACTIONS.SET_ERROR, payload: err.message || 'Failed to erase prompt' });
      throw err;
    } finally {
      dispatch({ type: PROMPT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const setPromptDraft = useCallback((text) => {
    dispatch({ type: PROMPT_ACTIONS.SET_DRAFT, payload: text });
  }, []);

  return {
    revisions: state.revisions,
    currentRevisionId: state.currentRevisionId,
    activePromptDraft: state.activePromptDraft,
    loading: state.historyLoading,
    error: state.error,
    rollback,
    erase,
    setPromptDraft,
    refetchHistory: fetchHistory,
  };
}
