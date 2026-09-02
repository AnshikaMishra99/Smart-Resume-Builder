import { useState } from "react";
import { Sparkles, Loader2, Plus, Check } from "lucide-react";
import api from "../api/axios.js";

/**
 * AI Skill Suggester
 * Props:
 *  - onAddSkills(category, values): callback that merges suggested
 *    skills for a category into the parent form's `skills` map.
 */
const SkillSuggester = ({ onAddSkills }) => {
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [addedCategories, setAddedCategories] = useState({});

  const handleSuggest = async () => {
    if (!jobRole.trim()) {
      setError("Please enter a target job role first.");
      return;
    }
    setError("");
    setLoading(true);
    setSuggestions(null);
    setAddedCategories({});
    try {
      const { data } = await api.post("/ai/suggest-skills", { jobRole });
      setSuggestions(data.suggestedSkills);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (category, values) => {
    onAddSkills(category, values);
    setAddedCategories((prev) => ({ ...prev, [category]: true }));
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-textDark">AI Skill Suggester</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Enter your target job role and get relevant skill suggestions.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          placeholder="e.g. Frontend Developer"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={handleSuggest}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Thinking..." : "Suggest Skills"}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {suggestions && (
        <div className="space-y-2">
          {Object.entries(suggestions).map(([category, values]) => (
            <div
              key={category}
              className="flex items-start justify-between gap-3 bg-white rounded-lg p-3 border border-gray-200"
            >
              <div>
                <p className="text-xs font-semibold text-textDark">{category}</p>
                <p className="text-xs text-gray-500 mt-0.5">{values}</p>
              </div>
              <button
                onClick={() => handleAdd(category, values)}
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                  addedCategories[category]
                    ? "bg-green-100 text-green-700"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {addedCategories[category] ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillSuggester;
