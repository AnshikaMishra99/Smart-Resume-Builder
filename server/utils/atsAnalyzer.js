const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
  'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren',
  "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't",
  'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't",
  'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn',
  "wouldn't", 'also', 'using', 'used', 'use', 'using', 'build', 'built', 'strong', 'ability', 'good', 'great', 
  'high', 'quality', 'new', 'highly', 'candidate', 'candidates', 'job', 'description', 'position', 'opportunity',
  'professional', 'also', 'say', 'says', 'said', 'shall', 'would', 'should', 'could', 'about', 'some', 'any', 
  'both', 'each', 'other', 'another', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
]);

// Dictionary of standard industry skill sets for common roles to map missing skills honestly
const ROLE_REQUIRED_KEYWORDS = {
  "android": ["kotlin", "java", "sdk", "retrofit", "room", "firebase", "compose", "xml", "mvvm"],
  "ios": ["swift", "uikit", "swiftui", "xcode", "coredata", "combine", "mvvm", "git"],
  "frontend": ["react", "javascript", "typescript", "html", "css", "tailwind", "next.js", "git", "vite"],
  "backend": ["node.js", "express", "python", "java", "sql", "mongodb", "postgresql", "api", "docker", "redis"],
  "full stack": ["react", "node.js", "javascript", "mongodb", "sql", "express", "api", "git", "typescript"],
  "devops": ["docker", "kubernetes", "terraform", "jenkins", "aws", "git", "ci/cd", "linux", "ansible"],
  "data science": ["python", "numpy", "pandas", "tensorflow", "pytorch", "scikit-learn", "sql", "tableau"],
  "data analyst": ["sql", "python", "excel", "tableau", "powerbi", "pandas", "analytics", "statistics"],
  "machine learning": ["python", "tensorflow", "pytorch", "scikit-learn", "numpy", "opencv", "nlp", "keras"],
  "cybersecurity": ["wireshark", "linux", "penetration", "vulnerability", "network", "firewall", "cryptography"],
  "software engineer": ["java", "python", "javascript", "sql", "git", "oop", "algorithms", "data structures"]
};

/**
 * Clean text and extract lowercase words, preserving special tech symbols like c++, c#, .net, react.js, etc.
 * @param {string} text 
 * @returns {string[]}
 */
export const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // Split by common separators that aren't part of tech words:
  // whitespace, comma, semicolon, colon, quotes, parens, brackets, braces, slashes, backslashes, etc.
  const rawTokens = text
    .toLowerCase()
    .split(/[\s,;:"'()\[\]{}|\\/]/);
    
  const tokens = [];
  for (let token of rawTokens) {
    // Strip trailing or leading period, question mark, exclamation, dash, or slash, but NOT + or #
    // e.g. "node.js." -> "node.js", "c++" -> "c++", "c#" -> "c#"
    token = token.replace(/[\.\!\?\-\/]+$/, '').replace(/^[\.\!\?\-\/]+/, '');
    
    if (token && /^[a-z0-9+#\.\-]+$/.test(token)) {
      tokens.push(token);
    }
  }
  return tokens;
};

/**
 * Helper to detect keyboard mashing and placeholder texts.
 * @param {string} text 
 * @returns {boolean}
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
  // Detect extremely short text or generic test strings
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
  // Detect keyboard mashing (e.g. "hdweguhed", "dhcw", "asdf", "qwerty")
  if (/^[asdfghjklqwertyuiopzxcvbnm]+$/.test(str) && str.length > 3) {
    // Flags random consonant clusters of length >= 4 (like "dw", "wg", "hd") or absence of vowels
    if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(str) || !/[aeiouy]/.test(str)) {
      return true;
    }
  }
  return false;
};

/**
 * Calculates a value between 0.1 and 1.0 reflecting resume completeness and realism.
 * @param {object} resumeData 
 * @returns {object} { score, Gaps }
 */
export const calculateResumeQuality = (resumeData) => {
  if (!resumeData) return { score: 0.1, Gaps: ["Resume data is empty"] };
  
  let score = 1.0;
  const Gaps = [];
  
  // 1. Personal Info
  const pi = resumeData.personalInfo || {};
  if (!pi.name || pi.name.trim() === "" || checkJunk(pi.name)) {
    score -= 0.1;
    Gaps.push("Full Name is empty or placeholder.");
  }
  if (!pi.email || pi.email.trim() === "" || checkJunk(pi.email)) {
    score -= 0.05;
    Gaps.push("Email address is missing or placeholder.");
  }
  if (!pi.phone || pi.phone.trim() === "" || checkJunk(pi.phone)) {
    score -= 0.05;
    Gaps.push("Phone number is missing or placeholder.");
  }
  
  // 2. Objective
  if (!resumeData.objective || resumeData.objective.trim() === "" || checkJunk(resumeData.objective) || resumeData.objective.trim().length < 25) {
    score -= 0.1;
    Gaps.push("Objective statement is empty, too short, or placeholder.");
  }
  
  // 3. Education
  if (!Array.isArray(resumeData.education) || resumeData.education.length === 0) {
    score -= 0.15;
    Gaps.push("Education credentials credentials section is empty.");
  } else {
    let eduJunk = false;
    resumeData.education.forEach(edu => {
      if (checkJunk(edu.institution) || checkJunk(edu.degree) || checkJunk(edu.details)) {
        eduJunk = true;
      }
    });
    if (eduJunk) {
      score -= 0.15;
      Gaps.push("Education credentials contain placeholder or invalid text.");
    }
  }
  
  // 4. Skills
  const skills = resumeData.skills || {};
  const skillCategories = Object.keys(skills);
  if (skillCategories.length === 0) {
    score -= 0.25;
    Gaps.push("Skills section is empty.");
  } else {
    let emptySkills = true;
    Object.values(skills).forEach(val => {
      if (val && val.trim() !== "" && !checkJunk(val)) {
        emptySkills = false;
      }
    });
    if (emptySkills) {
      score -= 0.2;
      Gaps.push("No valid skills list content entered.");
    }
  }
  
  // 5. Projects
  if (!Array.isArray(resumeData.projects) || resumeData.projects.length === 0) {
    score -= 0.25;
    Gaps.push("Projects section is empty.");
  } else {
    let projectJunk = false;
    let emptyProjectDetails = false;
    resumeData.projects.forEach(proj => {
      if (checkJunk(proj.title) || checkJunk(proj.techStack)) {
        projectJunk = true;
      }
      if (!proj.bullets || proj.bullets.length === 0 || proj.bullets.every(b => b.trim() === "" || checkJunk(b))) {
        emptyProjectDetails = true;
      }
    });
    if (projectJunk) {
      score -= 0.15;
      Gaps.push("Projects details contain placeholder or invalid text.");
    }
    if (emptyProjectDetails) {
      score -= 0.1;
      Gaps.push("Projects bullet points are empty or placeholder.");
    }
  }
  
  return {
    score: Math.max(0.1, score),
    Gaps
  };
};

/**
 * Extract unique non-stopwords from text
 * @param {string} text 
 * @returns {string[]}
 */
export const extractKeywords = (text) => {
  const tokens = tokenize(text);
  const uniqueKeywords = new Set();
  
  for (const token of tokens) {
    if (!STOP_WORDS.has(token) && isNaN(token)) {
      uniqueKeywords.add(token);
    }
  }
  
  return Array.from(uniqueKeywords);
};

/**
 * Extract key fields representing core skills and technologies
 * @param {object} resumeData 
 * @returns {string}
 */
const getHighRelevanceText = (resumeData) => {
  const parts = [];
  if (resumeData.skills && typeof resumeData.skills === 'object') {
    Object.entries(resumeData.skills).forEach(([key, val]) => {
      parts.push(key);
      if (typeof val === 'string') {
        parts.push(val);
      } else if (Array.isArray(val)) {
        parts.push(val.join(' '));
      }
    });
  }
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(proj => {
      if (proj.techStack) {
        parts.push(proj.techStack);
      }
    });
  }
  return parts.join(' ');
};

/**
 * Extract general content text
 * @param {object} resumeData 
 * @returns {string}
 */
const getGeneralText = (resumeData) => {
  const parts = [];
  if (resumeData.personalInfo) {
    const { name, location, email, title } = resumeData.personalInfo;
    if (name) parts.push(name);
    if (title) parts.push(title);
  }
  if (resumeData.objective) {
    parts.push(resumeData.objective);
  }
  if (Array.isArray(resumeData.education)) {
    resumeData.education.forEach(edu => {
      if (edu.institution) parts.push(edu.institution);
      if (edu.degree) parts.push(edu.degree);
    });
  }
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(proj => {
      if (proj.title) parts.push(proj.title);
      if (Array.isArray(proj.bullets)) {
        parts.push(proj.bullets.join(' '));
      }
    });
  }
  if (Array.isArray(resumeData.achievements)) {
    parts.push(resumeData.achievements.join(' '));
  }
  if (Array.isArray(resumeData.activities)) {
    parts.push(resumeData.activities.join(' '));
  }
  return parts.join(' ');
};

/**
 * Perform keyword-based ATS Analysis matching a resume against a job description
 * @param {object} resumeData 
 * @param {string} jobDescription 
 * @returns {object}
 */
export const analyzeATS = (resumeData, jobDescription) => {
  if (!jobDescription || jobDescription.trim() === "") {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      qualityGaps: [],
      error: "Job description is empty"
    };
  }

  // Extract base keywords from JD
  const baseJdKeywords = extractKeywords(jobDescription);
  const jdKeywordsSet = new Set(baseJdKeywords);

  // Scan JD text to inject industry-standard technical keywords dynamically
  const jdLower = jobDescription.toLowerCase();
  Object.entries(ROLE_REQUIRED_KEYWORDS).forEach(([role, keywords]) => {
    const isMatched = 
      role === "full stack" && (jdLower.includes("full stack") || jdLower.includes("fullstack")) ||
      role === "machine learning" && (jdLower.includes("machine learning") || jdLower.includes(" ml ") || jdLower.includes(" ai ")) ||
      role === "data science" && (jdLower.includes("data science") || jdLower.includes("data scientist")) ||
      role === "data analyst" && (jdLower.includes("data analyst") || jdLower.includes("data analysis")) ||
      role === "software engineer" && (jdLower.includes("software developer") || jdLower.includes("software engineer") || jdLower.includes("programmer") || jdLower.includes("developer")) ||
      role !== "full stack" && role !== "machine learning" && role !== "data science" && role !== "data analyst" && role !== "software engineer" && jdLower.includes(role);

    if (isMatched) {
      keywords.forEach(kw => jdKeywordsSet.add(kw));
    }
  });

  const jdKeywords = Array.from(jdKeywordsSet);

  if (jdKeywords.length === 0) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      qualityGaps: [],
      error: "No matching keywords found in job description"
    };
  }

  // Tokenize resume texts into separate skill and general categories
  const highRelevanceTokens = new Set(tokenize(getHighRelevanceText(resumeData)));
  const generalTokens = new Set(tokenize(getGeneralText(resumeData)));

  const matchedKeywords = [];
  const missingKeywords = [];

  let earnedPoints = 0;
  let maxPossiblePoints = jdKeywords.length * 3;

  for (const keyword of jdKeywords) {
    if (highRelevanceTokens.has(keyword)) {
      // Matches in Skills or Project Tech Stack (highly relevant)
      matchedKeywords.push(keyword);
      earnedPoints += 3;
    } else if (generalTokens.has(keyword)) {
      // Matches in general text (medium relevance)
      matchedKeywords.push(keyword);
      earnedPoints += 1;
    } else {
      missingKeywords.push(keyword);
    }
  }

  // Base Match score based on weighted relevance
  const baseScore = maxPossiblePoints > 0 ? (earnedPoints / maxPossiblePoints) * 100 : 0;

  // Audit resume for overall completeness and presence of placeholders/test entries
  const quality = calculateResumeQuality(resumeData);

  // Short JDs are penalized because they don't provide a realistic candidate matching environment
  const jdLengthFactor = jdKeywords.length >= 4 ? 1.0 : 0.5 + (jdKeywords.length * 0.125);

  // Smart and honest evaluation
  const score = Math.min(100, Math.max(0, Math.round(baseScore * quality.score * jdLengthFactor)));

  return {
    score,
    matchedKeywords,
    missingKeywords,
    qualityGaps: quality.Gaps
  };
};
