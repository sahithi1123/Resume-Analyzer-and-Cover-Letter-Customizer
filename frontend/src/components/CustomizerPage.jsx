import React from 'react';
import ResumeCustomizerContainer from './ResumeCustomizerContainer';

export default function CustomizerPage() {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          AI Resume & Cover Letter <span className="gradient-text-neon">Studio</span>
        </h1>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Follow 4 simple steps to match job requirements, strengthen your resume with metrics, and craft a tailored cover letter.
        </p>
      </div>

      <ResumeCustomizerContainer />
    </div>
  );
}
