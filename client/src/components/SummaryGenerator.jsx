import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import api from "../api/axios.js";

/**
 * AI Summary Generator
 * Props:
 *  - onGenerated(summaryText): callback to push the generated summary
 *    into the parent form's `objective` field.
 */
const SummaryGenerator = ({ onGenerated, skills }) => {
  const [jobProfile, setJobProfile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!jobProfile.trim()) {
      setError("Please enter a job profile/role first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/generate-summary", { jobProfile, skills });
      onGenerated(data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Wand2 className="w-4 h-4 text-secondary" />
        <h3 className="text-sm font-semibold text-textDark">AI Summary Generator</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Enter your target job profile and let AI write a polished objective for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="e.g. Full Stack Developer"
          value={jobProfile}
          onChange={(e) => setJobProfile(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/40"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SummaryGenerator;
