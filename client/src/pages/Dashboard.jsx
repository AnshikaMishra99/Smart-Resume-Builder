import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Pencil, Download, Trash2, Loader2, Sparkles, PlusCircle } from "lucide-react";
import api from "../api/axios.js";

/**
 * Dashboard
 * Fetches all resumes from the backend on mount and displays them as cards.
 * Each card supports: Edit (navigate to Builder with id), Download PDF,
 * and Delete (with confirmation).
 */
const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/resumes");
      setResumes(data);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const handleDownload = (id) => {
    try {
      const downloadUrl = `${api.defaults.baseURL || "http://localhost:5000/api"}/resumes/${id}/download`;
      window.location.href = downloadUrl;
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero / Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
            AI-Powered
          </span>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Smart Resume Builder</h1>
        <p className="text-white/90 max-w-2xl text-sm">
          Build, review, and polish your resume with AI — get instant feedback, skill
          suggestions, and professionally written summaries tailored to your target role.
        </p>
        <Link
          to="/builder"
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl mt-4 hover:bg-gray-50 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Resume
        </Link>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-textDark mb-1">No resumes yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first AI-powered resume to get started.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 bg-primary text-white font-medium px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-textDark text-sm">
                    {resume.personalInfo?.name || "Untitled Resume"}
                  </h3>
                  <p className="text-xs text-gray-500">{resume.personalInfo?.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  to={`/builder/${resume._id}`}
                  className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => handleDownload(resume._id, resume.personalInfo?.name || "Resume")}
                  disabled={downloadingId === resume._id}
                  className="flex items-center gap-1 text-xs font-medium bg-secondary/10 text-secondary-dark px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors disabled:opacity-60"
                >
                  {downloadingId === resume._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(resume._id)}
                  className="flex items-center gap-1 text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
