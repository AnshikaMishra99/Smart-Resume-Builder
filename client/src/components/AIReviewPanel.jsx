import { useState } from "react";
import { ClipboardCheck, Loader2, X, ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import api from "../api/axios.js";

/**
 * AI Resume Reviewer
 * Props:
 *  - resumeData: the current resume form state to send for analysis.
 */
const AIReviewPanel = ({ resumeData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleReview = async () => {
    setError("");
    setLoading(true);
    setIsOpen(true);
    try {
      const { data } = await api.post("/ai/review", { resumeData });
      setFeedback(data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <>
      <button
        onClick={handleReview}
        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <ClipboardCheck className="w-5 h-5" />
        Review with AI
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-lg text-textDark flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                AI Resume Review
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-sm">Analyzing your resume...</p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 text-center py-6">{error}</p>}

              {feedback && !loading && (
                <div className="space-y-5">
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex flex-col items-center justify-center w-24 h-24 rounded-full ${scoreColor(
                        feedback.overallScore
                      )}`}
                    >
                      <span className="text-3xl font-extrabold">{feedback.overallScore}</span>
                      <span className="text-xs font-medium">/ 10</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
                      <ThumbsUp className="w-4 h-4" /> Strengths
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                      {feedback.strengths?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Gaps to Address
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                      {feedback.gaps?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                      <Lightbulb className="w-4 h-4" /> Suggested Improvements
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
                      {feedback.improvements?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIReviewPanel;
