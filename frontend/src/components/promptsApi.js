import axiosClient from './axiosClient';

export const promptsApi = {
  getPromptHistory: async (targetType) => {
    const response = await axiosClient.get(`/prompts/history?targetType=${targetType}`);
    return response.data;
  },

  rollbackPrompt: async (targetType, targetRevisionId) => {
    const response = await axiosClient.post('/prompts/rollback', {
      targetType,
      targetRevisionId,
    });
    return response.data;
  },

  erasePrompt: async (revisionId) => {
    const response = await axiosClient.delete(`/prompts/erase/${revisionId}`);
    return response.data;
  },
};
