import axiosClient from './axiosClient';

export const customizerApi = {
  analyzeKeywords: async (payload) => {
    const response = await axiosClient.post('/customizer/analyze-keywords', payload);
    return response.data;
  },

  rewriteBullets: async (payload) => {
    const response = await axiosClient.post('/customizer/rewrite-bullets', payload);
    return response.data;
  },

  generateCoverLetter: async (payload) => {
    const response = await axiosClient.post('/customizer/generate-cover-letter', payload);
    return response.data;
  },
};
