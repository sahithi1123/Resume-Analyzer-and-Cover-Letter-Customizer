import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from './resumeApi';
import { useCustomizer } from './CustomizerContext';
import { FileText, Plus, Sparkles, Clock, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { setActiveResume, resetWorkspace } = useCustomizer();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await resumeApi.getMyResumes();
      setResumes(data || []);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCustomization = () => {
    resetWorkspace();
    navigate('/customizer');
  };

  const handleSelectResume = (resume) => {
    setActiveResume(resume);
    navigate('/customizer');
  };

  const handleDeleteResume = async (resumeId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this master resume?')) {
      return;
    }

    setDeletingId(resumeId);
    try {
      await resumeApi.deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      alert(err.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Master Resume Library
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your baseline master resumes and launch tailored ATS customization sessions.
          </p>
        </div>
        <button
          onClick={handleNewCustomization}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 text-sm transition-all self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Customization</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">Uploaded Master Resumes</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{resumes.length}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-cyan-300 dark:border-cyan-500/20 space-y-1">
          <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 uppercase">AI Parser Engines</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">PDFBox & POI</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/20 space-y-1">
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase">Active LLM Model</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">Google Gemini</div>
        </div>
      </div>

      {/* Resumes List */}
      <div className="glass-panel rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Documents</h2>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Loading your saved documents...</div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No resumes uploaded yet.</p>
            <button
              onClick={handleNewCustomization}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition-all shadow-sm active:scale-95"
            >
              Upload Your First Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-5 rounded-xl bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:border-cyan-400 dark:hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-cyan-700 dark:text-cyan-400 border border-gray-200 dark:border-gray-700 font-semibold">
                      {resume.fileType}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={resume.fileName}>
                    {resume.fileName}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 italic">
                    "{resume.textPreview}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800 gap-2">
                  <span className="text-xs text-gray-500 font-mono">
                    {resume.extractedCharacterCount} characters
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Delete Option */}
                    <button
                      onClick={(e) => handleDeleteResume(resume.id, e)}
                      disabled={deletingId === resume.id}
                      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-300 dark:hover:border-rose-500/30 transition-all text-xs flex items-center gap-1"
                      title="Delete saved document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>

                    <button
                      onClick={() => handleSelectResume(resume)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
