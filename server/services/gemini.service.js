import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Helper to check if a valid API key is set
const hasValidApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== "your_gemini_api_key_here" && key.trim() !== "";
};

// Initialize Gemini client only if key is valid to prevent initialization issues
let model = null;
if (hasValidApiKey()) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.error("Failed to initialize GoogleGenerativeAI client:", err.message);
  }
}

/**
 * Helper: extracts plain text from Gemini's response object.
 */
const getTextFromResponse = (result) => {
  return result.response.text().trim();
};

/**
 * Helper: removes markdown code fences (```json ... ```) that Gemini
 * sometimes wraps around JSON responses, so JSON.parse() doesn't fail.
 */
const cleanJsonResponse = (text) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Helper to detect keyboard mashing and placeholder texts.
 */
const checkJunk = (text) => {
  if (!text) return false;
  const str = text.toLowerCase().trim();
  if (
    str === "xyz.com" || 
    str === "example.com" || 
    str.includes("your name") || 
    str.includes("placeholder") || 
    str === "xxxxxxxxxx"
  ) {
    return true;
  }
  if (
    str === "very good project" || 
    str === "good project" || 
    str === "test" || 
    str === "abc" || 
    str === "hdweguhed" || 
    str === "dhcw"
  ) {
    return true;
  }
  if (/^[asdfghjklqwertyuiopzxcvbnm]+$/.test(str) && str.length > 3) {
    if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(str) || !/[aeiouy]/.test(str)) {
      return true;
    }
  }
  return false;
};

/**
 * Heuristic fallback evaluation generator if AI fails or key is missing
 */
const generateMockReview = (resumeData) => {
  const strengths = [];
  const gaps = [];
  const improvements = [];
  let score = 8.5;

  // Audit personal info
  const pi = resumeData?.personalInfo || {};
  if (!pi.name || pi.name.trim() === "") {
    gaps.push("Full Name is empty.");
    improvements.push("Add your full name at the top of the resume.");
    score -= 2.0;
  } else if (checkJunk(pi.name)) {
    gaps.push(`Full Name contains test or placeholder text ("${pi.name}").`);
    improvements.push("Replace placeholder name with your actual professional name.");
    score -= 2.5;
  } else {
    strengths.push("Candidate name is correctly formatted in header.");
  }
  
  if (!pi.location || pi.location.trim() === "") {
    gaps.push("Location is empty.");
    improvements.push("Add your city/state location.");
    score -= 0.5;
  } else if (checkJunk(pi.location)) {
    gaps.push(`Location contains test or placeholder text ("${pi.location}").`);
    improvements.push("Enter your real current location.");
    score -= 1.0;
  }

  if (!pi.phone || pi.phone.trim() === "") {
    gaps.push("Phone number is missing.");
    improvements.push("Add a mobile phone number for contact.");
    score -= 0.5;
  } else if (checkJunk(pi.phone)) {
    gaps.push(`Phone number is set to a placeholder ("${pi.phone}").`);
    improvements.push("Enter a valid 10-digit mobile phone number.");
    score -= 1.5;
  }

  if (!pi.email || pi.email.trim() === "") {
    gaps.push("Email is missing.");
    improvements.push("Add a professional email address.");
    score -= 1.0;
  } else if (checkJunk(pi.email)) {
    gaps.push("Email address is a placeholder.");
    improvements.push("Enter your real email address.");
    score -= 1.5;
  }

  if (pi.linkedin && checkJunk(pi.linkedin)) {
    gaps.push(`LinkedIn URL appears to be a placeholder ("${pi.linkedin}").`);
    improvements.push("Provide your actual LinkedIn profile link.");
    score -= 0.5;
  }
  if (pi.github && checkJunk(pi.github)) {
    gaps.push(`GitHub URL appears to be a placeholder ("${pi.github}").`);
    improvements.push("Provide your actual GitHub profile link.");
    score -= 0.5;
  }

  // Audit objective
  if (!resumeData?.objective || resumeData.objective.trim() === "") {
    gaps.push("Professional summary or objective statement is missing.");
    improvements.push("Write a 2-3 line career objective to clarify your career target.");
    score -= 1.5;
  } else if (checkJunk(resumeData.objective) || resumeData.objective.trim().length < 20) {
    gaps.push("Objective statement is too brief or contains generic/test text.");
    improvements.push("Expand objective with key technical focus areas and professional goals.");
    score -= 2.0;
  } else {
    strengths.push("Objective is detailed and sets a clear professional direction.");
  }

  // Audit education
  if (!resumeData?.education || resumeData.education.length === 0) {
    gaps.push("Education section has no entries.");
    improvements.push("List your college/school qualifications.");
    score -= 2.0;
  } else {
    let eduJunk = false;
    resumeData.education.forEach(edu => {
      if (checkJunk(edu.institution) || checkJunk(edu.degree) || checkJunk(edu.details)) {
        eduJunk = true;
      }
    });
    if (eduJunk) {
      gaps.push("Education details (institution name, degree, or scores) contain placeholder or invalid text.");
      improvements.push("Ensure all school/college names, degrees, and scores are accurate and professionally written.");
      score -= 2.5;
    } else {
      strengths.push("Academic qualifications are clearly documented.");
    }
  }

  // Audit projects
  if (!resumeData?.projects || resumeData.projects.length === 0) {
    gaps.push("No projects are listed.");
    improvements.push("List at least 1-2 coding projects showing practical experience.");
    score -= 2.0;
  } else {
    let projectJunk = false;
    resumeData.projects.forEach(proj => {
      if (checkJunk(proj.title) || checkJunk(proj.techStack) || proj.bullets.some(b => checkJunk(b))) {
        projectJunk = true;
      }
    });
    if (projectJunk) {
      gaps.push("Project details contain placeholder or invalid text.");
      improvements.push("Rewrite project titles and description bullet points with professional developer context.");
      score -= 2.5;
    } else {
      strengths.push("Projects detail relevant technical experience.");
    }
  }

  // Audit skills
  const skillCategories = Object.keys(resumeData?.skills || {});
  if (skillCategories.length === 0) {
    gaps.push("Skills section is empty.");
    improvements.push("Categorize and list your core programming, frontend, and backend skills.");
    score -= 2.0;
  } else {
    strengths.push("Skills are categorized and well-grouped.");
  }

  const overallScore = Math.min(10, Math.max(1, Math.round(score)));

  if (strengths.length === 0) strengths.push("Basic resume sections initialized.");
  if (gaps.length === 0) gaps.push("No obvious missing fields detected.");
  if (improvements.length === 0) improvements.push("Review and expand on specific project metrics.");

  return {
    overallScore,
    strengths,
    gaps,
    improvements
  };
};

/**
 * Heuristic fallback skill suggester - supports 13 common software engineering profiles
 */
const generateMockSkills = (jobRole) => {
  const suggestions = {
    "frontend": {
      "Programming Languages": "JavaScript (ES6+), TypeScript, HTML5, CSS3",
      "Frameworks/Libraries": "React.js, Next.js, Redux, TailwindCSS, SASS",
      "Tools/Platforms": "Git, GitHub, VS Code, Vite, npm, Vercel, Figma",
      "Concepts": "DOM Manipulation, RESTful APIs, Responsive Design, State Management, SPA"
    },
    "backend": {
      "Programming Languages": "Node.js (JavaScript), Python, Java, SQL, Go, C#",
      "Frameworks/Libraries": "Express.js, Django, Spring Boot, Fastify, NestJS, Mongoose",
      "Tools/Platforms": "MongoDB, PostgreSQL, MySQL, Redis, Docker, AWS, Postman",
      "Concepts": "RESTful APIs, MVC Architecture, Database Schema Design, JWT/OAuth Authentication, CI/CD"
    },
    "full stack": {
      "Programming Languages": "JavaScript, TypeScript, Python, HTML5/CSS3, SQL",
      "Frameworks/Libraries": "React.js, Node.js, Express.js, Next.js, TailwindCSS, Mongoose",
      "Tools/Platforms": "MongoDB, PostgreSQL, Docker, Git, GitHub, Vercel, AWS",
      "Concepts": "REST APIs, MVC, Database Design, Client-Server Architecture, SPA, CI/CD"
    },
    "data science": {
      "Programming Languages": "Python, R, SQL, Julia",
      "Frameworks/Libraries": "Pandas, NumPy, Scikit-Learn, TensorFlow, PyTorch, Keras",
      "Tools/Platforms": "Jupyter Notebook, Tableau, PowerBI, Git, Anaconda, AWS",
      "Concepts": "Data Visualization, Predictive Modeling, Machine Learning, Statistical Analysis, Deep Learning"
    },
    "data analyst": {
      "Programming Languages": "SQL, Python, R, SAS",
      "Frameworks/Libraries": "Pandas, NumPy, Matplotlib, Seaborn",
      "Tools/Platforms": "Excel, Tableau, PowerBI, Jupyter, Google Analytics, MySQL",
      "Concepts": "Data Cleaning, Exploratory Data Analysis, Dashboarding, A/B Testing, Reporting"
    },
    "machine learning": {
      "Programming Languages": "Python, C++, Java, R",
      "Frameworks/Libraries": "TensorFlow, PyTorch, Scikit-Learn, Keras, OpenCV, HuggingFace",
      "Tools/Platforms": "Docker, CUDA, Jupyter, AWS, MLflow, Git",
      "Concepts": "Model Training, NLP, Computer Vision, Neural Networks, Reinforcement Learning, MLOps"
    },
    "android": {
      "Programming Languages": "Kotlin, Java, XML",
      "Frameworks/Libraries": "Android SDK, Jetpack Compose, Retrofit, Room, Coroutines",
      "Tools/Platforms": "Android Studio, Gradle, Git, Firebase, Google Play Console",
      "Concepts": "Mobile UI/UX, MVVM Architecture, Push Notifications, REST API Integration, Local Database"
    },
    "ios": {
      "Programming Languages": "Swift, Objective-C",
      "Frameworks/Libraries": "UIKit, SwiftUI, CoreData, Combine, Alamofire",
      "Tools/Platforms": "Xcode, CocoaPods, Swift Package Manager, TestFlight, Git",
      "Concepts": "Apple Design Guidelines, MVVM, MVC, Autolayout, Mobile App Security"
    },
    "devops": {
      "Programming Languages": "Bash, Python, Go, YAML",
      "Frameworks/Libraries": "Terraform, Ansible, Kubernetes, Docker",
      "Tools/Platforms": "Jenkins, GitHub Actions, AWS, Linux/Unix, Prometheus, Grafana",
      "Concepts": "Infrastructure as Code, Continuous Integration, Continuous Deployment, Site Reliability, Monitoring"
    },
    "cybersecurity": {
      "Programming Languages": "Python, Bash, PowerShell, SQL",
      "Frameworks/Libraries": "Wireshark, Metasploit, Nmap, Snort",
      "Tools/Platforms": "Kali Linux, Burp Suite, Splunk, Git, AWS Cloud Security",
      "Concepts": "Penetration Testing, Vulnerability Assessment, Network Security, Cryptography, Incident Response"
    },
    "qa": {
      "Programming Languages": "Java, JavaScript, Python, SQL",
      "Frameworks/Libraries": "Selenium, Cypress, JUnit, TestNG, Jest",
      "Tools/Platforms": "Jira, Postman, Jenkins, Git, Selenium Grid",
      "Concepts": "Manual Testing, Test Automation, Bug Lifecycle, Regression Testing, API Testing"
    },
    "embedded": {
      "Programming Languages": "C, C++, Assembly, Python",
      "Frameworks/Libraries": "Arduino, FreeRTOS, ESP-IDF",
      "Tools/Platforms": "STM32, Raspberry Pi, Oscilloscope, Git, VS Code",
      "Concepts": "Microcontrollers, Real-time Systems, Hardware Debugging, GPIO/I2C/SPI Protocols"
    },
    "software engineer": {
      "Programming Languages": "Java, Python, C++, JavaScript, SQL",
      "Frameworks/Libraries": "Spring Boot, Django, React.js, Express.js",
      "Tools/Platforms": "Git, GitHub, VS Code, Docker, PostgreSQL, Linux",
      "Concepts": "Data Structures & Algorithms, Object-Oriented Programming, MVC, System Design, Agile Methodologies"
    }
  };

  const searchRole = (jobRole || "").toLowerCase();
  let matchedKey = "software engineer";
  
  if (searchRole.includes("front")) matchedKey = "frontend";
  else if (searchRole.includes("back")) matchedKey = "backend";
  else if (searchRole.includes("full")) matchedKey = "full stack";
  else if (searchRole.includes("machine") || searchRole.includes("ml") || searchRole.includes("ai")) matchedKey = "machine learning";
  else if (searchRole.includes("data scientist") || searchRole.includes("science")) matchedKey = "data science";
  else if (searchRole.includes("analyst") || searchRole.includes("analytics")) matchedKey = "data analyst";
  else if (searchRole.includes("android") || searchRole.includes("kotlin")) matchedKey = "android";
  else if (searchRole.includes("ios") || searchRole.includes("swift")) matchedKey = "ios";
  else if (searchRole.includes("devops") || searchRole.includes("cloud") || searchRole.includes("aws")) matchedKey = "devops";
  else if (searchRole.includes("security") || searchRole.includes("cyber")) matchedKey = "cybersecurity";
  else if (searchRole.includes("test") || searchRole.includes("qa") || searchRole.includes("quality")) matchedKey = "qa";
  else if (searchRole.includes("embedded") || searchRole.includes("iot") || searchRole.includes("hardware")) matchedKey = "embedded";
  else if (searchRole.includes("developer") || searchRole.includes("engineer") || searchRole.includes("programmer")) matchedKey = "software engineer";

  const formattedRole = matchedKey.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    jobRole: formattedRole,
    suggestedSkills: suggestions[matchedKey]
  };
};

/**
 * Heuristic fallback summary generator - custom compiles summary based on user skills in real-time
 */
const generateMockSummary = (jobProfile, skills) => {
  const TECH_ABBREVIATIONS = {
    "sql": "SQL",
    "dbms": "DBMS",
    "html": "HTML",
    "css": "CSS",
    "js": "JS",
    "aws": "AWS",
    "xml": "XML",
    "api": "API",
    "apis": "APIs",
    "rest": "REST",
    "mvc": "MVC",
    "git": "Git",
    "qa": "QA",
    "oop": "OOP",
    "sih": "SIH",
    "gpa": "GPA",
    "sgpa": "SGPA",
    "ui": "UI",
    "ux": "UX",
    "ui/ux": "UI/UX",
    "json": "JSON",
    "nosql": "NoSQL",
    "rdbms": "RDBMS",
    "ci/cd": "CI/CD",
    "dns": "DNS",
    "http": "HTTP",
    "https": "HTTPS",
    "url": "URL",
    "urls": "URLs",
    "dom": "DOM"
  };

  let skillList = "";
  if (skills) {
    const values = typeof skills === 'object' ? Object.values(skills) : [];
    const allSkills = values.flatMap(v => typeof v === 'string' ? v.split(',').map(s => s.trim()) : []);
    const uniqueSkills = [...new Set(allSkills)].filter(s => s.length > 0 && s.toLowerCase() !== "comma separated list");
    if (uniqueSkills.length > 0) {
      const formattedSkills = uniqueSkills.map(s => {
        const lower = s.toLowerCase();
        if (TECH_ABBREVIATIONS[lower]) {
          return TECH_ABBREVIATIONS[lower];
        }
        return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      });
      skillList = formattedSkills.slice(0, 5).join(", ");
    }
  }

  let profileNoun = jobProfile || "Software Developer";
  // Capitalize first letter of each word in jobProfile
  profileNoun = profileNoun.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const lowerProfile = profileNoun.toLowerCase().trim();
  
  let objectivePhrase = "";
  if (lowerProfile.includes("developer") || lowerProfile.includes("engineer") || lowerProfile.includes("analyst")) {
    const article = /^[aeiou]/.test(lowerProfile) ? "an" : "a";
    objectivePhrase = `as ${article} aspiring ${profileNoun}`;
  } else {
    objectivePhrase = `specializing in ${profileNoun}`;
  }

  const sentence1 = `Motivated and detail-oriented Computer Science student seeking to leverage strong problem-solving skills, academic training, and technical projects to contribute effectively ${objectivePhrase}.`;
  
  const sentence2 = skillList 
    ? `Proven hands-on proficiency in ${skillList}.` 
    : "";
    
  const sentence3 = `Dedicated to collaborating in technical teams to deliver clean, scalable code and solve complex software challenges.`;

  const summaryText = [sentence1, sentence2, sentence3].filter(Boolean).join(" ");

  return {
    summary: summaryText
  };
};

/**
 * AI Feature 1: Resume Reviewer
 * Sends the full resume JSON to Gemini and asks for structured feedback:
 * strengths, gaps/weaknesses, and actionable improvement suggestions.
 */
export const reviewResume = async (resumeData) => {
  if (!model) {
    console.log("⚠️ No valid GoogleGenerativeAI client. Returning dynamic heuristic mock review.");
    return generateMockReview(resumeData);
  }

  try {
    const prompt = `
You are an expert technical resume reviewer for software engineering campus placements.
Analyze the following resume JSON and provide constructive feedback.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Respond ONLY with valid JSON in this exact structure (no markdown, no extra text):
{
  "overallScore": <number from 1-10>,
  "strengths": ["point 1", "point 2", "point 3"],
  "gaps": ["gap 1", "gap 2", "gap 3"],
  "improvements": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"]
}
`;

    const result = await model.generateContent(prompt);
    const text = cleanJsonResponse(getTextFromResponse(result));
    return JSON.parse(text);
  } catch (error) {
    console.warn("⚠️ Live Gemini review request failed. Falling back to heuristic assessment. Error:", error.message);
    return generateMockReview(resumeData);
  }
};

/**
 * AI Feature 2: Skill Suggester
 * Takes a target job role (e.g. "Frontend Developer") and returns
 * a categorized list of relevant technical skills.
 */
export const suggestSkills = async (jobRole) => {
  if (!model) {
    console.log(`⚠️ No valid GoogleGenerativeAI client. Returning dynamic mock skills for: ${jobRole}`);
    return generateMockSkills(jobRole);
  }

  try {
    const prompt = `
You are a career advisor for software engineering students.
A student is targeting the job role: "${jobRole}".

Suggest relevant technical skills they should add to their resume.

Respond ONLY with valid JSON in this exact structure (no markdown, no extra text):
{
  "jobRole": "${jobRole}",
  "suggestedSkills": {
    "Programming Languages": "comma separated list",
    "Frameworks/Libraries": "comma separated list",
    "Tools/Platforms": "comma separated list",
    "Concepts": "comma separated list"
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = cleanJsonResponse(getTextFromResponse(result));
    return JSON.parse(text);
  } catch (error) {
    console.warn("⚠️ Live Gemini skill suggestion request failed. Falling back to suggestions index. Error:", error.message);
    return generateMockSkills(jobRole);
  }
};

/**
 * AI Feature 3: Summary Generator
 * Takes a job profile/role description and generates a polished
 * 3-4 line professional objective/summary for the resume.
 */
export const generateSummary = async (jobProfile, skills) => {
  if (!model) {
    console.log(`⚠️ No valid GoogleGenerativeAI client. Generating dynamic mock summary for: ${jobProfile}`);
    return generateMockSummary(jobProfile, skills);
  }

  try {
    const prompt = `
You are a professional resume writer for software engineering students.
The student's target job profile/role is: "${jobProfile}".
${skills ? `The student's technical skills are: ${JSON.stringify(skills)}.` : ""}

Write a polished, professional 3-4 line resume objective/summary.
- It should be confident, specific, and ATS-friendly.
${skills ? "- Incorporate some of the key technical skills where relevant." : ""}
- Avoid generic buzzwords; mention relevant technical focus areas.
- Do not use first-person pronouns excessively.

Respond ONLY with valid JSON in this exact structure (no markdown, no extra text):
{
  "summary": "the generated 3-4 line summary text"
}
`;

    const result = await model.generateContent(prompt);
    const text = cleanJsonResponse(getTextFromResponse(result));
    return JSON.parse(text);
  } catch (error) {
    console.warn("⚠️ Live Gemini summary generation request failed. Falling back to heuristic generator. Error:", error.message);
    return generateMockSummary(jobProfile, skills);
  }
};
