import { Plus, Trash2 } from "lucide-react";
import SummaryGenerator from "./SummaryGenerator.jsx";
import SkillSuggester from "./SkillSuggester.jsx";

/**
 * ResumeForm
 * The main data-entry form. Fully controlled by parent (Builder.jsx)
 * via `data` and `setData` props, so the live preview stays in sync.
 *
 * Section order matches the resume layout:
 * Personal Info -> Objective -> Education -> Skills -> Projects ->
 * Achievements & Awards -> Activities
 */

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40";

const skillsInputClass =
  "px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40";

const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

const SectionCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h2 className="text-base font-bold text-textDark mb-3">{title}</h2>
    {children}
  </div>
);

const ResumeForm = ({ data, setData }) => {
  // ---------- Personal Info ----------
  const updatePersonalInfo = (field, value) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  // ---------- Objective ----------
  const updateObjective = (value) => {
    setData((prev) => ({ ...prev, objective: value }));
  };

  // ---------- Education ----------
  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", duration: "", details: "" }],
    }));
  };

  const updateEducation = (index, field, value) => {
    setData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // ---------- Skills ----------
  const addSkillCategory = () => {
    setData((prev) => ({
      ...prev,
      skills: { ...prev.skills, "": "" },
    }));
  };

  const updateSkillCategory = (oldKey, newKey, value) => {
    setData((prev) => {
      const updated = { ...prev.skills };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return { ...prev, skills: updated };
    });
  };

  const removeSkillCategory = (key) => {
    setData((prev) => {
      const updated = { ...prev.skills };
      delete updated[key];
      return { ...prev, skills: updated };
    });
  };

  // Called by SkillSuggester when user clicks "Add"
  const handleAddSuggestedSkills = (category, values) => {
    setData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [category]: values },
    }));
  };

  // ---------- Projects ----------
  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", techStack: "", bullets: [""] }],
    }));
  };

  const updateProject = (index, field, value) => {
    setData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addProjectBullet = (projIndex) => {
    setData((prev) => {
      const updated = [...prev.projects];
      updated[projIndex].bullets = [...updated[projIndex].bullets, ""];
      return { ...prev, projects: updated };
    });
  };

  const updateProjectBullet = (projIndex, bulletIndex, value) => {
    setData((prev) => {
      const updated = [...prev.projects];
      const bullets = [...updated[projIndex].bullets];
      bullets[bulletIndex] = value;
      updated[projIndex] = { ...updated[projIndex], bullets };
      return { ...prev, projects: updated };
    });
  };

  const removeProjectBullet = (projIndex, bulletIndex) => {
    setData((prev) => {
      const updated = [...prev.projects];
      updated[projIndex].bullets = updated[projIndex].bullets.filter((_, i) => i !== bulletIndex);
      return { ...prev, projects: updated };
    });
  };

  // ---------- Achievements ----------
  const addAchievement = () => {
    setData((prev) => ({ ...prev, achievements: [...prev.achievements, ""] }));
  };

  const updateAchievement = (index, value) => {
    setData((prev) => {
      const updated = [...prev.achievements];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  };

  const removeAchievement = (index) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // ---------- Activities ----------
  const addActivity = () => {
    setData((prev) => ({ ...prev, activities: [...prev.activities, ""] }));
  };

  const updateActivity = (index, value) => {
    setData((prev) => {
      const updated = [...prev.activities];
      updated[index] = value;
      return { ...prev, activities: updated };
    });
  };

  const removeActivity = (index) => {
    setData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-5">
      {/* Personal Info */}
      <SectionCard title="Personal Information">
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
          <label className="text-xs font-semibold text-gray-600">Accent Theme Color:</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={data.color || "#4F46E5"}
              onChange={(e) => setData((prev) => ({ ...prev, color: e.target.value }))}
              className="w-8 h-8 cursor-pointer border border-gray-200 rounded-md"
            />
            <span className="text-xs text-gray-500 font-mono uppercase">{data.color || "#4F46E5"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              className={inputClass}
              value={data.personalInfo.name}
              onChange={(e) => updatePersonalInfo("name", e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Location</label>
            <input
              type="text"
              className={inputClass}
              value={data.personalInfo.location}
              onChange={(e) => updatePersonalInfo("location", e.target.value)}
              placeholder="Enter your location"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="text"
              className={inputClass}
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              placeholder="XXXXXXXXXX"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              type="text"
              className={inputClass}
              value={data.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input
              type="text"
              className={inputClass}
              value={data.personalInfo.github}
              onChange={(e) => updatePersonalInfo("github", e.target.value)}
              placeholder="github.com/username"
            />
          </div>
        </div>
      </SectionCard>

      {/* Objective */}
      <SectionCard title="Objective">
        <div className="space-y-3">
          <SummaryGenerator onGenerated={updateObjective} skills={data.skills} />
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={data.objective}
            onChange={(e) => updateObjective(e.target.value)}
            placeholder="Detail-oriented Computer Science student seeking..."
          />
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard title="Education">
        <div className="space-y-4">
          {data.education.map((edu, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3 relative">
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Institution</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="Enter Institution name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Degree / Board</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                    placeholder="Enter your degree/board"
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.duration}
                    onChange={(e) => updateEducation(idx, "duration", e.target.value)}
                    placeholder="Enter Duration"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Details (GPA / Percentage)</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={edu.details}
                    onChange={(e) => updateEducation(idx, "details", e.target.value)}
                    placeholder="Enter your gpa/percentage"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills">
        <div className="space-y-3">
          <SkillSuggester onAddSkills={handleAddSuggestedSkills} />
          {Object.entries(data.skills).map(([category, values], idx) => (
            <div key={idx} className="flex gap-2 items-start w-full">
              <input
                type="text"
                className={`${skillsInputClass} w-1/3`}
                value={category}
                onChange={(e) => updateSkillCategory(category, e.target.value, values)}
                placeholder="Category (e.g. Programming Languages)"
              />
              <input
                type="text"
                className={`${skillsInputClass} flex-1`}
                value={values || ""}
                onChange={(e) => updateSkillCategory(category, category, e.target.value)}
                placeholder="Java, JavaScript, SQL"
              />
              <button
                onClick={() => removeSkillCategory(category)}
                className="text-gray-400 hover:text-red-500 mt-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addSkillCategory}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Skill Category
          </button>
        </div>
      </SectionCard>

      {/* Projects */}
      <SectionCard title="Projects">
        <div className="space-y-4">
          {data.projects.map((proj, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3 relative space-y-2">
              <button
                onClick={() => removeProject(idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div>
                <label className={labelClass}>Project Title</label>
                <input
                  type="text"
                  className={inputClass}
                  value={proj.title}
                  onChange={(e) => updateProject(idx, "title", e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className={labelClass}>Tech Stack</label>
                <input
                  type="text"
                  className={inputClass}
                  value={proj.techStack}
                  onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                  placeholder="Enter tech stack"
                />
              </div>
              <div>
                <label className={labelClass}>Description Bullets</label>
                <div className="space-y-2">
                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2">
                      <input
                        type="text"
                        className={inputClass}
                        value={bullet}
                        onChange={(e) => updateProjectBullet(idx, bIdx, e.target.value)}
                        placeholder="Describe your project"
                      />
                      <button
                        onClick={() => removeProjectBullet(idx, bIdx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addProjectBullet(idx)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addProject}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </SectionCard>

      {/* Achievements & Awards */}
      <SectionCard title="Achievements & Awards">
        <div className="space-y-2">
          {data.achievements.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                className={inputClass}
                value={item}
                onChange={(e) => updateAchievement(idx, e.target.value)}
                placeholder="Enter achievements/awards"
              />
              <button
                onClick={() => removeAchievement(idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addAchievement}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Achievement
          </button>
        </div>
      </SectionCard>

      {/* Activities */}
      <SectionCard title="Activities">
        <div className="space-y-2">
          {data.activities.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                className={inputClass}
                value={item}
                onChange={(e) => updateActivity(idx, e.target.value)}
                placeholder="Enter activities"
              />
              <button
                onClick={() => removeActivity(idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addActivity}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default ResumeForm;
