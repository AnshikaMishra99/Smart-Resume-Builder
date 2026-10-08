import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Pencil, Download, Trash2, Loader2, Sparkles, PlusCircle } from "lucide-react";
import api from "../api/axios.js";

/**
 * Dashboard
 * Fetches all user resumes from backend on mount and displays them as cards.
 * Each card supports: Edit (navigate to Builder with id), Download PDF (with Bearer auth),
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
      alert(err.response?.data?.message || "Failed to delete resume");
    }
  };

  const handleDownload = async (id, name) => {
    setDownloadingId(id);
    try {
      const res = await api.get(`/resumes/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const targetResume = resumes.find((r) => r._id === id);
      const resumeName = name || targetResume?.personalInfo?.name || "Resume";
      link.setAttribute("download", `${resumeName.replace(/\s+/g, "_")}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      let errorMsg = "Failed to download PDF. Please try again.";
      if (err.response && err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMsg = json.message;
        } catch (e) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      alert(errorMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero / Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-amber-300" />
          <span className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
            AI-Powered MERN Resume Builder
          </span>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Smart Resume Builder</h1>
        <p className="text-indigo-100 max-w-2xl text-sm leading-relaxed">
          Build, review, and polish your resume with AI — get instant feedback, skill
          suggestions, and professionally written summaries tailored to your target role.
        </p>
        <Link
          to="/builder"
          className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2.5 rounded-xl mt-5 hover:bg-indigo-50 transition-colors shadow-sm text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Resume
        </Link>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No resumes found</h3>
          <p className="text-sm text-slate-500 mb-4">
            Create your first AI-powered resume to get started.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-sm"
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
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {resume.personalInfo?.name || "Untitled Resume"}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{resume.personalInfo?.email}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  to={`/builder/${resume._id}`}
                  className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => handleDownload(resume._id, resume.personalInfo?.name)}
                  disabled={downloadingId === resume._id}
                  className="flex items-center gap-1 text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-60"
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
                  className="flex items-center gap-1 text-xs font-semibold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors ml-auto"
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
