import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Download, Loader2, CheckCircle2 } from "lucide-react";
import api from "../api/axios.js";
import ResumeForm from "../components/ResumeForm.jsx";
import ResumePreview from "../components/ResumePreview.jsx";
import AIReviewPanel from "../components/AIReviewPanel.jsx";
import ATSAnalyzerPanel from "../components/ATSAnalyzerPanel.jsx";

/**
 * Default empty resume state. Matches the Resume.model.js schema shape.
 */
const emptyResume = {
  personalInfo: {
    name: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
  },
  objective: "",
  education: [],
  skills: {},
  projects: [],
  achievements: [],
  activities: [],
  color: "#4F46E5",
};

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(emptyResume);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  const initialLoadDone = useRef(false);
  const lastSavedIdRef = useRef(null);
  const lastSavedDataRef = useRef("");

  // If editing an existing resume, fetch its data on mount.
  useEffect(() => {
    initialLoadDone.current = false;
    if (id) {
      if (lastSavedIdRef.current === id) {
        initialLoadDone.current = true;
        return;
      }
      setLoading(true);
      api
        .get(`/resumes/${id}`)
        .then((res) => {
          const resume = res.data;
          const merged = {
            ...resume,
            skills: resume.skills || {},
          };
          setData(merged);
          lastSavedDataRef.current = JSON.stringify(merged);
          setTimeout(() => {
            initialLoadDone.current = true;
          }, 0);
        })
        .catch((err) => console.error("Failed to load resume:", err))
        .finally(() => setLoading(false));
    } else {
      setData(emptyResume);
      lastSavedDataRef.current = JSON.stringify(emptyResume);
      setTimeout(() => {
        initialLoadDone.current = true;
      }, 0);
    }
  }, [id]);

  // Debounced auto-save
  useEffect(() => {
    if (!initialLoadDone.current) return;

    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSavedDataRef.current) return;

    setAutoSaveStatus("Saving draft...");
    const timer = setTimeout(async () => {
      try {
        if (id) {
          await api.put(`/resumes/${id}`, data);
          lastSavedDataRef.current = currentDataStr;
          setAutoSaveStatus("Draft auto-saved");
        } else {
          const res = await api.post("/resumes", data);
          lastSavedIdRef.current = res.data._id;
          lastSavedDataRef.current = JSON.stringify(res.data);
          navigate(`/builder/${res.data._id}`, { replace: true });
          setAutoSaveStatus("Draft auto-saved");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setAutoSaveStatus("Auto-save failed");
      } finally {
        setTimeout(() => setAutoSaveStatus(""), 3000);
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [data, id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const currentDataStr = JSON.stringify(data);
      if (id) {
        await api.put(`/resumes/${id}`, data);
        lastSavedDataRef.current = currentDataStr;
        setSaveStatus("Resume updated successfully!");
      } else {
        const res = await api.post("/resumes", data);
        lastSavedIdRef.current = res.data._id;
        lastSavedDataRef.current = JSON.stringify(res.data);
        setSaveStatus("Resume created successfully!");
        navigate(`/builder/${res.data._id}`, { replace: true });
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("Failed to save. Please check required fields.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleDownload = () => {
    if (!id) {
      setSaveStatus("Please save your resume before downloading.");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }
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
      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-textDark">
            {id ? "Edit Resume" : "Create New Resume"}
          </h1>
          <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2">
            <span>Fill in your details, then save and download your polished resume.</span>
            {autoSaveStatus && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                autoSaveStatus === "Saving draft..."
                  ? "bg-amber-50 text-amber-600 animate-pulse"
                  : autoSaveStatus === "Auto-save failed"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                {autoSaveStatus === "Saving draft..." && <Loader2 className="w-3 h-3 animate-spin" />}
                {autoSaveStatus}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AIReviewPanel resumeData={data} />
          <ATSAnalyzerPanel resumeData={data} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-white border border-gray-300 text-textDark font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-primary text-white font-medium px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4 border border-green-200">
          <CheckCircle2 className="w-4 h-4" />
          {saveStatus}
        </div>
      )}

      {/* Form + Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeForm data={data} setData={setData} />
        <div className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Live Preview
          </h2>
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  );
};

export default Builder;
