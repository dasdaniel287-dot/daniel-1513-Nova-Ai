import { ModeMetadata } from '../types';

export const ASSISTANT_MODES: ModeMetadata[] = [
  {
    id: 'general',
    name: 'General Assistant',
    nameBn: 'সাধারণ সহকারী',
    tagline: 'Everyday intellect, thoughtful reasoning, multifaceted problem-solving',
    description: 'Handles general questions, analytical reasoning, summaries, and everyday tasks with calm precision.',
    icon: 'Sparkles',
    badge: 'Universal',
    capabilities: ['Multilingual (EN/BN)', 'Context Awareness', 'Complex Reasoning', 'Balanced Synthesis'],
    starterPrompts: [
      {
        en: 'Explain quantum computing in simple terms with a real-world metaphor.',
        bn: 'কোয়ান্টাম কম্পিউটিং সহজ ভাষায় একটি বাস্তব উপমার মাধ্যমে ব্যাখ্যা করুন।',
      },
      {
        en: 'Help me plan a structured 3-month personal development roadmap.',
        bn: 'আমার জন্য একটি গোছানো ৩ মাসের ব্যক্তিগত উন্নতির পরিকল্পনা তৈরি করুন।',
      },
      {
        en: 'Analyze the pros and cons of remote work vs hybrid work models.',
        bn: 'রিমোট কাজ বনাম হাইব্রিড কাজের সুবিধার ও অসুবিধার তুলনা করুন।',
      },
    ],
  },
  {
    id: 'coding',
    name: 'Coding Assistant',
    nameBn: 'কোডিং সহকারী',
    tagline: 'Architecture, debugging, refactoring, full-stack implementation',
    description: 'Expert coding partner for TypeScript, Python, React, algorithms, unit tests, and system architecture.',
    icon: 'Code2',
    badge: 'Sandbox & Runner',
    capabilities: ['Syntax Highlighting', 'Live Execution Sandbox', 'Code Refactor & Debug', 'Unit Test Generation'],
    starterPrompts: [
      {
        en: 'Write a TypeScript debounce hook with cancellation and immediate execution options.',
        bn: 'ক্যানসেলেশন সহ একটি টাইপস্ক্রিপ্ট ডিবাইউন্স হুক লিখুন।',
      },
      {
        en: 'Explain how event loop and microtasks work in JavaScript with visual diagrams.',
        bn: 'জাভাস্ক্রিপ্ট ইভেন্ট লুপ এবং মাইক্রোটাস্ক কীভাবে কাজ করে তা বিস্তারিত বোঝান।',
      },
      {
        en: 'Review this code for edge cases, memory leaks, and performance bottlenecks.',
        bn: 'কোডের পারফরম্যান্স এবং সম্ভাব্য বাগ নিরীক্ষা করে দিন।',
      },
    ],
  },
  {
    id: 'research',
    name: 'Research Assistant',
    nameBn: 'গবেষণা সহকারী',
    tagline: 'Web-grounded research, fact verification, cited sources',
    description: 'Conducts thorough research queries with real-time Google Search grounding and verifiable citations.',
    icon: 'Globe',
    badge: 'Search Grounding',
    capabilities: ['Real-Time Google Search', 'Clickable Source Citations', 'Comparative Analysis', 'Evidence Checking'],
    starterPrompts: [
      {
        en: 'What are the most significant breakthroughs in fusion energy this year?',
        bn: 'এই বছরের ফিউশন এনার্জির সবচেয়ে বড় অগ্রগতিগুলি কী কী?',
      },
      {
        en: 'Synthesize the latest findings on solid-state battery commercialization timelines.',
        bn: 'সলিড-স্টেট ব্যাটারি বাণিজ্যিকীকরণের সর্বশেষ অবস্থা তুলে ধরুন।',
      },
      {
        en: 'Compare top lightweight vector databases for small-to-medium AI deployments.',
        bn: 'ছোট ও মাঝারি এআই অ্যাপের জন্য সেরা ভেক্টর ডাটাবেসগুলোর তুলনা করুন।',
      },
    ],
  },
  {
    id: 'writing',
    name: 'Writing Assistant',
    nameBn: 'লেখালিখি সহকারী',
    tagline: 'Essays, executive summaries, proposals, high-caliber prose',
    description: 'Polishes tone, refines rhetoric, crafts publication-ready articles, and writes authentic Bengali & English copy.',
    icon: 'PenTool',
    badge: 'Prose & Polish',
    capabilities: ['Tone Calibration', 'Structural Flow', 'Bilingual Mastery (EN/BN)', 'Vocabulary Enhancement'],
    starterPrompts: [
      {
        en: 'Draft a polite but firm executive email addressing a project timeline delay.',
        bn: 'প্রকল্পের সময়সীমা বৃদ্ধির বিষয়ে একটি মার্জিত পেশাদার ইমেল খসড়া তৈরি করুন।',
      },
      {
        en: 'Write an inspiring introductory keynote speech on technological craftsmanship.',
        bn: 'প্রযুক্তি এবং কারুশিল্পের মেলবন্ধন নিয়ে একটি অনুপ্রেরণামূলক বক্তব্য লিখুন।',
      },
      {
        en: 'Rewrite this paragraph to improve readability, rhythm, and persuasive power.',
        bn: 'এই অনুচ্ছেদটির ভাষা আরও আকর্ষণীয় এবং প্রভাবশালী করে পুনর্লিখন করুন।',
      },
    ],
  },
  {
    id: 'document',
    name: 'Document Assistant',
    nameBn: 'ডকুমেন্ট সহকারী',
    tagline: 'PDF, DOCX, CSV deep extraction, QA, document comparison',
    description: 'Analyzes uploaded documents with section citations, key metrics extraction, and multi-file comparison.',
    icon: 'FileText',
    badge: 'Multi-doc QA',
    capabilities: ['PDF / CSV / TXT Parsing', 'Section Citations', 'Document Comparison', 'Data Summarization'],
    starterPrompts: [
      {
        en: 'Summarize the executive summary, key risks, and financial projections of this document.',
        bn: 'এই ডকুমেন্টের মূল সারাংশ, ঝুঁকি এবং আর্থিক পূর্বাভাস তুলে ধরুন।',
      },
      {
        en: 'Extract all deadlines, commitments, and named stakeholders into a markdown table.',
        bn: 'ডকুমেন্ট থেকে সমস্ত সময়সীমা এবং দায়িত্বপ্রাপ্ত ব্যক্তিদের তালিকা বের করুন।',
      },
      {
        en: 'Compare Document A and Document B highlighting key discrepancies.',
        bn: 'উভয় দলিলের মধ্যকার মূল অমিল ও পার্থক্যগুলো চিহ্নিত করুন।',
      },
    ],
  },
  {
    id: 'learning',
    name: 'Learning Assistant',
    nameBn: 'শিক্ষা ও টিউটরিং',
    tagline: 'Socratic tutoring, intuitive analogies, interactive quizzes',
    description: 'Guides learners through step-by-step masterclasses, active recall tests, and personalized study guides.',
    icon: 'GraduationCap',
    badge: 'Socratic Tutor',
    capabilities: ['First-Principles Teaching', 'Interactive Quizzes', 'Progressive Difficulty', 'Active Recall'],
    starterPrompts: [
      {
        en: 'Teach me the intuition behind Bayesian probability step-by-step with interactive questions.',
        bn: 'বেয়েশিয়ান সম্ভাব্যতা সহজ উদাহরণ সহ ধাপে ধাপে শেখান।',
      },
      {
        en: 'Create a 5-question test with explanations on distributed system consensus (Raft/Paxos).',
        bn: 'ডিস্ট্রিবিউটেড সিস্টেম কনসেনসাস নিয়ে ব্যাখ্যা সহ ৫টি বহুনির্বাচনী প্রশ্ন তৈরি করুন।',
      },
      {
        en: 'Explain how attention mechanisms in Transformers work without complex math jargon.',
        bn: 'ট্রান্সফরমার মডেলে অ্যাটেনশন মেকানিজম কীভাবে কাজ করে সহজ উপমায় বোঝান।',
      },
    ],
  },
  {
    id: 'data',
    name: 'Data Assistant',
    nameBn: 'ডাটা অ্যানালিস্ট',
    tagline: 'Spreadsheets, CSV analysis, statistical insights, trends',
    description: 'Inspects structured data, computes metrics, identifies outliers, and recommends visualization structures.',
    icon: 'BarChart3',
    badge: 'CSV & Metrics',
    capabilities: ['Tabular CSV Preview', 'Descriptive Stats', 'Outlier Detection', 'Visualization Schemas'],
    starterPrompts: [
      {
        en: 'Analyze this sample sales CSV to find top growth categories and seasonal trends.',
        bn: 'বিক্রয় ডাটা বিশ্লেষণ করে শীর্ষ পণ্য ও ঋতুভিত্তিক প্রবণতা বের করুন।',
      },
      {
        en: 'What statistical tests should I run to evaluate A/B test conversion significance?',
        bn: 'এ/বি টেস্টিং এর ফলাফল যাচাই করতে কোন পরিসংখ্যান পরীক্ষা ব্যবহার করা উচিত?',
      },
      {
        en: 'Provide clean summary statistics (mean, median, IQR, skewness) for this dataset.',
        bn: 'এই তথ্যের গড়, মধ্যমা এবং বন্টনের রূপরেখা তৈরি করুন।',
      },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Assistant',
    nameBn: 'উৎপাদনশীলতা সহকারী',
    tagline: 'Task roadmaps, Eisenhower matrices, daily action blocks',
    description: 'Organizes chaotic backlogs into clear priority matrices, actionable task checklists, and focused timeboxes.',
    icon: 'CheckSquare',
    badge: 'Task Roadmaps',
    capabilities: ['1-Click Task Extraction', 'Eisenhower Prioritization', 'Timeboxing', 'Actionable Checklists'],
    starterPrompts: [
      {
        en: 'Break down launching a SaaS MVP into prioritized sprints with clear milestones.',
        bn: 'একটি নতুন সফটওয়্যার প্রজেক্ট চালুর ধাপগুলো অগ্রাধিকার ভিত্তিতে সাজান।',
      },
      {
        en: 'Design an optimal daily schedule for deep cognitive work and minimal burnout.',
        bn: 'গভীর মনোযোগ এবং উচ্চ কার্যক্ষমতার জন্য একটি আদর্শ দৈনিক রুটিন তৈরি করুন।',
      },
      {
        en: 'Help me categorize my current goals into the Eisenhower Urgent vs Important matrix.',
        bn: 'আইজেনহাওয়ার ম্যাট্রিক্স ব্যবহার করে আমার কাজগুলো শ্রেণীবদ্ধ করুন।',
      },
    ],
  },
  {
    id: 'creative',
    name: 'Creative Assistant',
    nameBn: 'সৃজনশীল সহকারী',
    tagline: 'Brainstorming, worldbuilding, scripts, evocative concepts',
    description: 'Generates creative angles, fiction narratives, poetry, visual prompts, and imaginative ideas.',
    icon: 'Palette',
    badge: 'Ideation & Vision',
    capabilities: ['Worldbuilding & Lore', 'Dialogue & Screenplay', 'Image Prompt Crafting', 'Concept Cross-Pollination'],
    starterPrompts: [
      {
        en: 'Pitch 3 original sci-fi story premises involving memory synchronization technology.',
        bn: 'স্মৃতি সিনক্রোনাইজেশন প্রযুক্তি নিয়ে ৩টি মৌলিক বৈজ্ঞানিক কল্পকাহিনীর প্লট প্রস্তাব করুন।',
      },
      {
        en: 'Write a moody poetic monologue set in a rainy futuristic metropolis.',
        bn: 'বৃষ্টিস্নাত ভবিষ্যতের এক নিঃসঙ্গ শহরের পটভূমিতে একটি কাব্যিক মনোলগ লিখুন।',
      },
      {
        en: 'Generate descriptive image prompts for atmospheric fantasy concept art.',
        bn: 'বায়ুমণ্ডলীয় ফ্যান্টাসি আর্টের জন্য বিশদ প্রম্পট লিখে দিন।',
      },
    ],
  },
  {
    id: 'personal',
    name: 'Personal Assistant',
    nameBn: 'ব্যক্তিগত সহকারী',
    tagline: 'Custom memory, preferences, daily schedule, supportive clarity',
    description: 'Keeps track of your working style, remembered context, routines, and personal preferences with complete privacy.',
    icon: 'UserCheck',
    badge: 'Personal Memory',
    capabilities: ['Private AI Memory', 'Adaptive Tone', 'Routine Tracking', 'Personal Knowledge Base'],
    starterPrompts: [
      {
        en: 'Based on my saved preferences, review my schedule and suggest optimizations.',
        bn: 'আমার সংরক্ষিত পছন্দ অনুযায়ী আজকের সময়সূচি পর্যালোচনা করে পরামর্শ দিন।',
      },
      {
        en: 'What are my current active goals and what should I focus on today?',
        bn: 'আমার বর্তমান লক্ষ্যগুলো কী কী এবং আজকে কোনটিতে মনোযোগ দেওয়া উচিত?',
      },
      {
        en: 'Help me reflect on this week’s wins, challenges, and lessons learned.',
        bn: 'এই সপ্তাহের সাফল্য ও চ্যালেঞ্জগুলোর একটি গঠনমূলক পর্যালোচনা করুন।',
      },
    ],
  },
];
