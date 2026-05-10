// ========== TEMPLATES ==========
export const TEMPLATES = [
  // ── Free ────────────────────────────────────────────────────────────────
  { id: "classic",       name: "Basic Professional", desc: "Traditional serif, single column",     premium: false, accent: "#1a2e4a" },
  { id: "modern",        name: "Modern Clean",        desc: "Two-column with accent header",        premium: false, accent: "#b84a2e" },
  { id: "minimal",       name: "Simple ATS",          desc: "Maximum whitespace, top ATS score",    premium: false, accent: "#2a2a2a" },
  { id: "sleek",         name: "Sleek",               desc: "Split header, teal accent, clean",     premium: false, accent: "#0f766e" },
  { id: "canvas",        name: "Canvas",              desc: "Light sidebar, warm two-column",       premium: false, accent: "#44403c" },
  // ── Premium ─────────────────────────────────────────────────────────────
  { id: "executive",     name: "Executive",           desc: "Bold navy leadership style",           premium: true,  accent: "#0d2540" },
  { id: "creative",      name: "Creative Designer",   desc: "Editorial sidebar layout",             premium: true,  accent: "#7c2d12" },
  { id: "technical",     name: "Tech Pro",            desc: "Monospace developer layout",           premium: true,  accent: "#14532d" },
  { id: "elegant",       name: "Minimal Elegant",     desc: "Refined serif with gold accents",      premium: true,  accent: "#78350f" },
  { id: "corporate",     name: "Corporate Pro",       desc: "Clean structured corporate design",    premium: true,  accent: "#1e3a5f" },
  { id: "fresher",       name: "Fresher / Student",   desc: "Education-first for new grads",        premium: true,  accent: "#1d4ed8" },
  { id: "international", name: "International",       desc: "EU / global standard format",          premium: true,  accent: "#374151" },
  { id: "twocolumn",     name: "Two Column",          desc: "Balanced dual-column layout",          premium: true,  accent: "#1a1a2e" },
  { id: "apex",          name: "Apex",                desc: "Refined serif, gradient accents",       premium: true,  accent: "#2563eb" },
  { id: "meridian",      name: "Meridian",            desc: "Light sidebar, sky-blue two-column",    premium: true,  accent: "#0369a1" },
];

// ========== JOB ROLE DEFINITIONS ==========
export const JOB_ROLE_DEFS = [
  { id:"frontend",      icon:"⚛️",  role:"Frontend Developer",      kw:["react","vue","angular","javascript","typescript","html","css","tailwind","next.js","frontend","redux","sass","webpack","svelte"],        why:"Your frontend framework expertise and UI implementation skills are highly sought after.",      strengths:["Modern JS frameworks","UI/UX implementation","Responsive design"] },
  { id:"backend",       icon:"⚙️",  role:"Backend Developer",        kw:["node.js","python","java","golang","django","flask","express","spring","api","rest","graphql","backend","microservices","redis","postgresql","mongodb"], why:"Your server-side engineering and API design experience are in critical demand.",         strengths:["Server-side development","API design","Database architecture"] },
  { id:"fullstack",     icon:"🔧",  role:"Full Stack Developer",     kw:["full stack","mern","mean","react","node.js","mongodb","mysql","postgresql","fullstack","web development","firebase"], why:"Your end-to-end development capability makes you exceptionally versatile.",             strengths:["End-to-end engineering","Multiple tech stacks","Full product ownership"] },
  { id:"data_analyst",  icon:"📊",  role:"Data Analyst",             kw:["sql","excel","tableau","power bi","python","r","data analysis","analytics","statistics","pandas","numpy","data visualization","looker","spreadsheet"], why:"Your ability to transform raw data into business insights is invaluable.",           strengths:["Data analysis","Business intelligence","Statistical reasoning"] },
  { id:"data_scientist",icon:"🧬",  role:"Data Scientist",           kw:["machine learning","deep learning","tensorflow","pytorch","scikit-learn","python","nlp","ai","data science","neural networks","sklearn","keras","computer vision"], why:"Your ML/AI expertise positions you at the frontier of modern technology.",   strengths:["Predictive modeling","Statistical ML","Research & experimentation"] },
  { id:"ml_engineer",   icon:"🤖",  role:"ML Engineer",              kw:["mlops","model deployment","feature engineering","model training","deep learning","tensorflow","pytorch","kubernetes","docker","python","pipeline","spark"], why:"You bridge cutting-edge ML research and reliable production systems.",            strengths:["ML pipelines","Model deployment","Production AI"] },
  { id:"uiux",          icon:"🎨",  role:"UI/UX Designer",           kw:["figma","sketch","adobe xd","ui design","ux design","wireframe","prototype","user research","usability","photoshop","illustrator","user experience","interaction design","design system"], why:"Your design craft and user empathy create products people love to use.", strengths:["User research","Visual design","Interaction design"] },
  { id:"product",       icon:"📋",  role:"Product Manager",          kw:["product management","roadmap","user stories","agile","scrum","stakeholder","strategy","kpi","metrics","okr","prioritization","go-to-market","product strategy"], why:"Your strategic vision and ability to align teams make you a natural PM.",  strengths:["Product strategy","Stakeholder management","Data-driven prioritization"] },
  { id:"devops",        icon:"🔄",  role:"DevOps Engineer",          kw:["docker","kubernetes","ci/cd","jenkins","github actions","aws","azure","gcp","terraform","ansible","linux","bash","devops","monitoring","helm","prometheus"], why:"Your infrastructure and automation expertise accelerates software delivery at scale.", strengths:["CI/CD automation","Cloud infrastructure","Reliability engineering"] },
  { id:"cloud",         icon:"☁️",  role:"Cloud Architect",          kw:["aws","azure","gcp","cloud","terraform","serverless","lambda","s3","ec2","rds","cloudformation","vpc","networking","security groups","cost optimization"], why:"Cloud-first strategy is driving massive demand for architects like you.",   strengths:["Multi-cloud design","Infrastructure as code","Cost optimisation"] },
  { id:"swe",           icon:"💻",  role:"Software Engineer",        kw:["software","engineering","algorithms","data structures","oop","system design","git","java","c++","python","coding","problem solving","leetcode","competitive programming"], why:"Your strong CS fundamentals open doors across the entire software industry.", strengths:["Core programming","System design","Technical depth"] },
  { id:"python_dev",    icon:"🐍",  role:"Python Developer",         kw:["python","django","flask","fastapi","pandas","numpy","automation","scripting","pytest","celery","sqlalchemy","asyncio","pydantic"], why:"Python's versatility in web, data, and AI keeps demand for your skills surging.", strengths:["Python ecosystem","Automation & scripting","Data handling"] },
  { id:"android",       icon:"📱",  role:"Android Developer",        kw:["android","kotlin","java","mobile","android studio","firebase","gradle","jetpack","compose","mvvm","room","retrofit"], why:"Android powers billions of devices — your skills are globally valuable.",           strengths:["Android ecosystem","Mobile UX","App performance"] },
  { id:"ios",           icon:"🍎",  role:"iOS Developer",            kw:["ios","swift","objective-c","xcode","swiftui","uikit","cocoapods","apple","combine","arkit","coredata"], why:"Apple's premium ecosystem creates strong demand for skilled iOS engineers.",         strengths:["Swift & SwiftUI","Apple ecosystem","Performance optimisation"] },
  { id:"security",      icon:"🛡️",  role:"Cybersecurity Analyst",    kw:["security","cybersecurity","pentesting","penetration testing","network security","soc","siem","ethical hacking","ceh","cissp","firewall","vulnerability","wireshark","burp suite"], why:"Every organisation needs your expertise to protect critical assets.",         strengths:["Threat analysis","Security frameworks","Risk management"] },
  { id:"qa",            icon:"✅",  role:"QA / Test Engineer",       kw:["testing","qa","quality assurance","selenium","cypress","jest","unit testing","automation","test cases","bug","postman","playwright","appium"], why:"Your testing expertise is the last line of defence between code and production.", strengths:["Test automation","Quality processes","Attention to detail"] },
  { id:"business_analyst",icon:"📈",role:"Business Analyst",         kw:["business analysis","requirements","stakeholder","process improvement","jira","agile","sql","excel","reporting","strategy","erp","gap analysis","business intelligence"], why:"You connect business goals and technical solutions — a rare and valued skill.",   strengths:["Requirements gathering","Process optimisation","Analytical communication"] },
  { id:"finance",       icon:"💰",  role:"Finance Analyst",          kw:["finance","financial analysis","accounting","excel","investment","banking","cfa","financial modeling","valuation","equity","budgeting","forecasting","bloomberg"], why:"Your financial acumen helps organisations make better capital allocation decisions.", strengths:["Financial modelling","Investment analysis","Strategic planning"] },
  { id:"marketing",     icon:"📣",  role:"Growth / Marketing Analyst",kw:["marketing","seo","sem","google analytics","social media","content","digital marketing","campaigns","roi","cpc","growth","branding","a/b testing","conversion"], why:"Your data-driven marketing skills help businesses scale efficiently.",        strengths:["Digital marketing","Analytics & attribution","Growth strategy"] },
  { id:"content",       icon:"✍️",  role:"Content & Technical Writer",kw:["writing","content","blog","copywriting","editing","proofreading","seo","wordpress","journalism","technical writing","documentation","markdown"], why:"Clear communication is rare — your writing makes complex ideas accessible.",   strengths:["Content strategy","Technical documentation","Audience engagement"] },
];

export const JOB_PLATFORMS = [
  { name:"LinkedIn",    bg:"#0077b5", url:(r)=>`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(r)}&location=India` },
  { name:"Indeed",      bg:"#003a9b", url:(r)=>`https://in.indeed.com/jobs?q=${encodeURIComponent(r)}` },
  { name:"Naukri",      bg:"#e11d48", url:(r)=>`https://www.naukri.com/${r.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-jobs` },
  { name:"Internshala", bg:"#006fb9", url:(r)=>`https://internshala.com/jobs/${r.toLowerCase().replace(/[^a-z0-9]+/g,'-')}/` },
];

export function analyzeJobRoles(resume) {
  const text = [
    resume.personal?.title,
    resume.personal?.summary,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap(e => [e.role, e.company, ...(e.bullets || [])]),
    ...(resume.education || []).flatMap(e => [e.degree, e.school, e.details]),
    ...(resume.projects || []).flatMap(p => [p.name, p.description]),
    ...(resume.certifications || []).flatMap(c => [c.name, c.issuer]),
  ].filter(Boolean).join(' ').toLowerCase();

  return JOB_ROLE_DEFS
    .map(job => {
      const matched = job.kw.filter(k => text.includes(k));
      if (!matched.length) return null;
      const base  = (matched.length / job.kw.length) * 68;
      const bonus = Math.min(30, matched.length * 4.5);
      const score = Math.round(Math.min(98, base + bonus));
      return { ...job, score, matchedSkills: matched.slice(0, 6) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
