/**
 * ResumePreview
 * Renders a live, print-style preview of the resume data,
 * replicating the layout order from the reference image:
 * Header -> Objective -> Education -> Skills -> Projects ->
 * Achievements & Awards -> Activities.
 *
 * Props:
 *  - data: the resume form state object
 */
const SectionHeading = ({ children, color }) => (
  <h3 
    className="text-[13px] font-bold text-textDark uppercase tracking-wide border-b-2 pb-0.5 mt-3 mb-1.5"
    style={{ borderColor: color }}
  >
    {children}
  </h3>
);

const ResumePreview = ({ data }) => {
  const { personalInfo, objective, education, skills, projects, achievements, activities, color } = data;
  const themeColor = color || "#4F46E5";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 text-[12px] leading-snug" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-extrabold text-textDark">
          {personalInfo?.name || "Your Name"}
        </h1>
        {personalInfo?.location && (
          <p className="text-gray-600 text-[11px] mt-1">{personalInfo.location}</p>
        )}
        <p className="text-gray-600 text-[11px]">
          {[personalInfo?.phone, personalInfo?.email].filter(Boolean).join("  |  ")}
        </p>
        {(personalInfo?.linkedin || personalInfo?.github) && (
          <p className="text-[11px] font-medium" style={{ color: themeColor }}>
            {[personalInfo?.linkedin, personalInfo?.github].filter(Boolean).join("   |   ")}
          </p>
        )}
      </div>

      {/* Objective */}
      {objective && (
        <div>
          <SectionHeading color={themeColor}>Objective</SectionHeading>
          <p className="text-gray-700">{objective}</p>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div>
          <SectionHeading color={themeColor}>Education</SectionHeading>
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-start mb-1">
              <div>
                <p className="font-bold text-textDark">{edu.institution}</p>
                <p className="text-gray-700">{edu.degree}</p>
                {edu.details && <p className="text-gray-500 text-[11px]">{edu.details}</p>}
              </div>
              <p className="text-gray-700 whitespace-nowrap ml-2">{edu.duration}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <div>
          <SectionHeading color={themeColor}>Skills</SectionHeading>
          {Object.entries(skills).map(([category, values]) =>
            values ? (
              <p key={category} className="text-gray-700 mb-0.5">
                <span className="font-bold text-textDark">{category}: </span>
                {values}
              </p>
            ) : null
          )}
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div>
          <SectionHeading color={themeColor}>Projects</SectionHeading>
          {projects.map((proj, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-bold text-textDark">{proj.title}</p>
              {proj.techStack && (
                <p className="text-gray-500 text-[11px]">Tech Stack: {proj.techStack}</p>
              )}
              <ul className="list-disc list-inside text-gray-700 mt-0.5 space-y-0.5">
                {proj.bullets?.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Achievements & Awards */}
      {achievements?.length > 0 && (
        <div>
          <SectionHeading color={themeColor}>Achievements &amp; Awards</SectionHeading>
          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
            {achievements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Activities */}
      {activities?.length > 0 && (
        <div>
          <SectionHeading color={themeColor}>Activities</SectionHeading>
          <ul className="list-disc list-inside text-gray-700 space-y-0.5">
            {activities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
