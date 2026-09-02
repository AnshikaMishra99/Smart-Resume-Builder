import { useState } from "react";
import { Target, Loader2, X, Check, AlertCircle, HelpCircle } from "lucide-react";
import api from "../api/axios.js";

/**
 * ATS Keyword Match Analyzer Panel
 * Props:
 *  - resumeData: the current resume form state
 */
const ATSAnalyzerPanel = ({ resumeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/ats-match", {
        resumeData,
        jobDescription,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze ATS match. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200 stroke-emerald-600";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200 stroke-amber-600";
    return "text-rose-600 bg-rose-50 border-rose-200 stroke-rose-600";
  };

  const getScoreCircleColor = (score) => {
    if (score >= 75) return "rgb(16, 185, 129)"; // emerald-500
    if (score >= 50) return "rgb(245, 158, 11)"; // amber-500
    return "rgb(239, 68, 68)"; // rose-500
  };

  // SVG Circular progress constants
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result ? circumference - (result.score / 100) * circumference : circumference;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-gray-300 text-textDark font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Target className="w-5 h-5 text-secondary-dark" />
        ATS Match Score
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-textDark flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                ATS Keyword Matcher
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Job Description Input Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste Job Description (JD)
                </label>
                <textarea
                  className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-sans"
                  placeholder="Paste the target job description here to analyze matching keywords..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Matches tech keywords and skills.
                  </span>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Fit"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm px-4 py-2.5 rounded-xl border border-rose-100 mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Match Results */}
              {result && !loading && (
                <div className="space-y-6 pt-2 border-t border-gray-50">
                  {/* Score circle */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r={radius}
                          className="stroke-gray-200"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r={radius}
                          stroke={getScoreCircleColor(result.score)}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-gray-800">{result.score}%</span>
                        <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Match</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-gray-800 text-base">
                        {result.score >= 75
                          ? "Excellent Match!"
                          : result.score >= 50
                          ? "Good Starting Point"
                          : "Needs Revision"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        This local score measures the exact overlap of technical keywords from the job description in your resume. Excludes stop words.
                      </p>
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Matched Keywords ({result.matchedKeywords.length})
                    </h4>
                    {result.matchedKeywords.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No matching keywords found.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.map((word, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Missing Keywords ({result.missingKeywords.length})
                    </h4>
                    {result.missingKeywords.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Excellent! You have matched all keywords.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((word, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <span className="text-rose-500 text-xs font-bold font-mono">+</span>
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quality Gaps */}
                  {result.qualityGaps && result.qualityGaps.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Resume Quality Deductions ({result.qualityGaps.length})
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-800 bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl list-disc list-inside leading-relaxed">
                        {result.qualityGaps.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ATSAnalyzerPanel;
