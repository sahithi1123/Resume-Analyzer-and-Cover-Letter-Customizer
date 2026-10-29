import axiosClient from './axiosClient';

export const resumeApi = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyResumes: async () => {
    const response = await axiosClient.get('/resume/my-resumes');
    return response.data;
  },

  getResumeById: async (resumeId) => {
    const response = await axiosClient.get(`/resume/${resumeId}`);
    return response.data;
  },

  deleteResume: async (resumeId) => {
    const response = await axiosClient.delete(`/resume/${resumeId}`);
    return response.data;
  },
};
