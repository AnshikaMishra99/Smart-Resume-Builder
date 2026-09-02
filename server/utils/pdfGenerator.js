import PDFDocument from "pdfkit";

/**
 * Draws a section heading with a bold label and a horizontal underline,
 * matching the style in the reference resume (e.g. "OBJECTIVE", "EDUCATION").
 */
const drawSectionHeading = (doc, title, color) => {
  doc.moveDown(0.5);
  doc.font("Times-Bold").fontSize(12).fillColor("#111827").text(title.toUpperCase());
  const y = doc.y + 2;
  doc
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .lineWidth(1)
    .strokeColor(color || "#4F46E5")
    .stroke();
  doc.moveDown(0.5);
};

/**
 * Generates a PDF Buffer from resume data, following the exact section
 * order: Header -> Objective -> Education -> Skills -> Projects ->
 * Achievements & Awards -> Activities.
 *
 * Returns a Promise that resolves to a Buffer (so the controller can
 * send it directly as a file download).
 */
export const generateResumePDF = (resumeData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const { personalInfo, objective, education, skills, projects, achievements, activities, color } =
        resumeData;

      const themeColor = color || "#4F46E5";

      // ----- HEADER -----
      const candidateName = (personalInfo.name || "").trim() || "Your Name";
      doc.font("Times-Bold").fontSize(26).fillColor("#111827").text(candidateName, {
        align: "center",
      });

      doc.moveDown(0.2);
      doc
        .font("Times-Roman")
        .fontSize(10)
        .fillColor("#374151")
        .text(personalInfo.location || "", { align: "center" });

      const contactLine = [personalInfo.phone, personalInfo.email]
        .filter(Boolean)
        .join("  |  ");
      doc.text(contactLine, { align: "center" });

      const linksLine = [personalInfo.linkedin, personalInfo.github]
        .filter(Boolean)
        .join("   |   ");
      if (linksLine) {
        doc.fillColor(themeColor).text(linksLine, { align: "center" });
      }

      doc.moveDown(0.5);

      // ----- OBJECTIVE -----
      if (objective) {
        drawSectionHeading(doc, "Objective", themeColor);
        doc.font("Times-Roman").fontSize(10).fillColor("#1F2937").text(objective, {
          align: "left",
        });
      }

      // ----- EDUCATION -----
      if (education && education.length > 0) {
        drawSectionHeading(doc, "Education", themeColor);
        education.forEach((edu) => {
          const startY = doc.y;
          doc.font("Times-Bold").fontSize(10.5).fillColor("#111827").text(edu.institution);
          doc
            .font("Times-Roman")
            .fontSize(10)
            .fillColor("#374151")
            .text(edu.degree, { align: "left" });
          if (edu.details) {
            doc.fontSize(9).fillColor("#6B7280").text(edu.details, { align: "left" });
          }

          // Save the bottom position of the left column
          const endY = doc.y;

          // Duration aligned to the right of the institution line
          doc
            .font("Times-Roman")
            .fontSize(10)
            .fillColor("#374151")
            .text(edu.duration, doc.page.width - doc.page.margins.right - 120, startY, {
              width: 120,
              align: "right",
            });

          // Restore text cursor coordinates to the left margin and the saved bottom Y
          doc.x = doc.page.margins.left;
          doc.y = endY;

          doc.moveDown(0.3);
        });
      }

      // ----- SKILLS -----
      if (skills && Object.keys(skills).length > 0) {
        drawSectionHeading(doc, "Skills", themeColor);
        Object.entries(skills).forEach(([category, values]) => {
          if (!values) return;
          doc
            .font("Times-Bold")
            .fontSize(10)
            .fillColor("#111827")
            .text(`${category}: `, { continued: true });
          doc.font("Times-Roman").fillColor("#374151").text(values);
        });
      }

      // ----- PROJECTS -----
      if (projects && projects.length > 0) {
        drawSectionHeading(doc, "Projects", themeColor);
        projects.forEach((proj) => {
          doc.font("Times-Bold").fontSize(10.5).fillColor("#111827").text(proj.title);
          if (proj.techStack) {
            doc
              .font("Times-Roman")
              .fontSize(9.5)
              .fillColor("#6B7280")
              .text(`Tech Stack: ${proj.techStack}`);
          }
          (proj.bullets || []).forEach((bullet) => {
            doc
              .font("Times-Roman")
              .fontSize(10)
              .fillColor("#1F2937")
              .text(`•  ${bullet}`, { indent: 10 });
          });
          doc.moveDown(0.3);
        });
      }

      // ----- ACHIEVEMENTS & AWARDS -----
      if (achievements && achievements.length > 0) {
        drawSectionHeading(doc, "Achievements & Awards", themeColor);
        achievements.forEach((item) => {
          doc.font("Times-Roman").fontSize(10).fillColor("#1F2937").text(`•  ${item}`, {
            indent: 10,
          });
        });
      }

      // ----- ACTIVITIES -----
      if (activities && activities.length > 0) {
        drawSectionHeading(doc, "Activities", themeColor);
        activities.forEach((item) => {
          doc.font("Times-Roman").fontSize(10).fillColor("#1F2937").text(`•  ${item}`, {
            indent: 10,
          });
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
