// Everything Ali says about himself lives here, so copy changes never touch components.
// Source of truth: Ali's Content Bank v2 (May 2026). His own words take priority; Part B of
// the bank is internal and never goes on the site. House rules: never say "idea" (say
// "product"), no "better X than most Y" lines, no em dashes, AI only inside the philosophy.

const ASSET = "https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/images";
export const asset = (file: string) => `${ASSET}/${file}`;

export const person = {
  name: "Ali Farghaly",
  short: "Ali",
  tagline: "Developer and product manager.",
  photo: asset("1771468357918-1733826677030.jpeg"),
  roles: ["Developer", "Product manager", "Technical writer", "Systems builder"],
  intro:
    "I take what's in someone's head and make it real in a different medium: databases, apps, and the docs that keep them running.",
};

export const contact = {
  email: "a.ad.farghaly@gmail.com",
  call: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Chat%20with%20Ali&details=Let%27s%20discuss%20your%20project&add=a.ad.farghaly@gmail.com",
  linkedin: "https://www.linkedin.com/in/aaliadell",
  upwork: "https://www.upwork.com/freelancers/~014e76709caf4b807e?mp_source=share",
  whatsapp: "https://wa.me/971585218715",
  whatsappLabel: "+971 585 218 715",
};

export type StackCategory = "Builds" | "Systems";
export type Tool = { name: string; icon: string; categories: StackCategory[]; featured?: boolean };

export const tools: Tool[] = [
  { name: "Bubble.io", icon: asset("1771335693080-bubble-icon-filled-256.webp"), categories: ["Builds"], featured: true },
  { name: "Airtable", icon: asset("1771468204606-airtable.svg"), categories: ["Systems"], featured: true },
  { name: "Notion", icon: asset("1771468395425-notion-app-logo.png"), categories: ["Systems"], featured: true },
  { name: "Canva", icon: asset("1771468403585-canva-logo-png-small-size.png"), categories: ["Builds"], featured: true },
  { name: "Claude.ai", icon: asset("1771468411751-64px-claude-ai-symbol.svg.png"), categories: ["Builds", "Systems"], featured: true },
  { name: "Zapier", icon: asset("1771468435071-cdnlogo.com-zapier.svg"), categories: ["Builds", "Systems"], featured: true },
  { name: "Make.com", icon: asset("1771468445798-make-color.svg"), categories: ["Builds", "Systems"], featured: true },
  { name: "ClickUp", icon: asset("1771468489701-629e250b974c5f2c1ceaa621.png"), categories: ["Systems"], featured: true },
  { name: "Softr.io", icon: asset("1771468528283-softr-studio-icon-filled-256.webp"), categories: ["Builds"], featured: true },
  { name: "Jira", icon: asset("1771468715281-jira.png"), categories: ["Systems"], featured: true },
  { name: "BDK", icon: asset("1771468422279-bg-white-font-white-native.png"), categories: ["Builds"] },
  { name: "Stripe", icon: asset("1771468457346-stripe.svg"), categories: ["Builds"] },
  { name: "ChatGPT", icon: asset("1771468470151-64px-chatgpt-logo.svg.png"), categories: ["Builds", "Systems"] },
  { name: "Supabase", icon: asset("1771468603279-supabase-icon-filled-256.webp"), categories: ["Builds"] },
  { name: "Firebase", icon: asset("1771468562194-firebase-icon-filled-256.webp"), categories: ["Builds"] },
  { name: "OneSignal", icon: asset("1771468625778-onesignal-logo-png-transparent.png"), categories: ["Builds"] },
  { name: "Brevo", icon: asset("1771468478517-brevo-logo-1.svg"), categories: ["Systems"] },
];

export const paths = [
  {
    key: "Builds" as StackCategory,
    index: "01",
    title: "Build it",
    sub: "The product",
    body: "Full-stack web apps and native iOS and Android apps in Bubble.io. Admin dashboards with role-based access, Stripe payments, OpenAI integrations and complex relational databases. Database first, then the logic, then the interface.",
    bullets: ["Web apps", "Native mobile", "Admin dashboards", "Stripe & AI integrations"],
  },
  {
    key: "Systems" as StackCategory,
    index: "02",
    title: "Run it",
    sub: "The system around it",
    body: "Scoping, backlogs, QA and documentation. I wear this hat when it's missing. If your specs are already solid, I don't waste your time re-scoping: I build, and flag anything that doesn't add up.",
    bullets: ["Scoping", "Backlogs", "QA cycles", "Documentation"],
  },
];


// "One person, one path": the build and the system are two stops on the same line (Content Bank 4, 18)
export const onePath = {
  lede: "Neither of my products had a product manager, a QA lead or a documentation team. I was all of those, because that's what building properly looks like when you care about the outcome. I call it building cleanly: brainstorm, plan, prioritize, build, and document as I go. When I'm done, the system works and someone else can maintain it.",
  quote: "The mechanism changes. The discipline doesn't.",
};

// The stack: today's toolbox, not the limit. Each pair = a tool Ali knows → one it carries over to.
export const stack = {
  note: "Bubble.io is where I build most today, but I don't want to live inside one tool. Proper input, proper output: the method works on any platform, and the skills carry over. If I know Notion, I'm at home in Linear by the afternoon.",
  learning: [
    { knows: "Bubble.io", next: "Lovable" },
    { knows: "Claude.ai", next: "Claude Code" },
    { knows: "Notion", next: "Linear" },
    { knows: "Zapier", next: "n8n" },
    { knows: "Jira", next: "Asana" },
    { knows: "Canva", next: "Figma" },
    { knows: "Softr.io", next: "Webflow" },
    { knows: "ClickUp", next: "Monday" },
  ],
};

// The four principles behind the philosophy (Content Bank 2, 3, 4, 6), in Ali's words.
export const principles = [
  {
    title: "Read the intention",
    body: "What you mean and what ends up in the spec are never quite the same. I work from both, and ask clarifying questions when they don't match.",
    glyph: "heart",
  },
  {
    title: "Four versions, one DNA",
    body: "Every product exists four times: in your head, in what you manage to say, in what gets built, and in how each user lives it. My job is to keep all four sharing the same DNA.",
    glyph: "nodes",
  },
  {
    title: "The calculator rule",
    body: "Calculators didn't stop us doing math; they freed us for the actual problem. That's how I use AI: it handles the tedious part, and I still do the thinking.",
    glyph: "spark",
  },
  {
    title: "Document with purpose",
    body: "I scope when it's necessary and document when it serves a real purpose. Never for the sake of it, and never more time on the docs than on the build.",
    glyph: "doc",
  },
] as const;

// The path (Content Bank 2, 4, 14, 15). Client-facing only: nothing from Part B.
export const journey = [
  {
    years: "2017 – 2021",
    role: "Translator",
    lede: "Before I learned to manage any product, I learned to manage myself.",
    body: "B.A. in Translation and Simultaneous Interpretation, Arabic and English, from Al-Alsun, Ain Shams University (3.7 GPA). Freelancing while I studied taught me to break big projects into small chunks, prioritize, and deliver on deadlines. Translation taught me to care about the input as much as the output.",
  },
  {
    years: "2021 – 2024",
    role: "Builder",
    lede: "Building is translation into a different language: designs, databases and apps.",
    body: "I joined ChannelSculptor in Dubai as a translator for mena.tv, and the work kept growing: admin, product, then Product Technical Lead. My first Bubble project taught me the tool. Then I rebuilt mena.tv on my own: web, iOS, Android and an admin dashboard, with 650+ companies at launch.",
  },
  {
    years: "2024 – Now",
    role: "Developer & PM",
    lede: "Somebody had to organize the work. With no one else there, that someone was me.",
    body: "I was the product manager and the engineering team at once, writing backlogs for myself long before anyone gave me the title. I closed my time at mena.tv with a full wiki, so the team runs it without me. Now I build for clients as a freelance developer who also does the PM work.",
  },
];

// Translation as a metaphor: what each old medium became.
export const translations = [
  { from: "grammar", to: "database structures" },
  { from: "tone", to: "color systems" },
  { from: "sentence rhythm", to: "user flows" },
];

// Working together (Content Bank 9, 10)
export const workingStyle = [
  { title: "Structured Hours", body: "9 AM to 6 PM GST, Monday to Friday. Focused work blocks. I don't perform busyness, and I don't do midnight Slack messages.", glyph: "sun" },
  { title: "Suggestions, Not Demands", body: "If something in the spec doesn't add up, I research it, make it visual, and show you both options. Your call, always.", glyph: "scope" },
  { title: "Milestones", body: "Milestone-based delivery, database first. If something shifts, you hear it early.", glyph: "time" },
  { title: "Documentation", body: "Organized, documented, tested work that you can understand and maintain without me in the room.", glyph: "doc" },
] as const;

// The Sorting Room: raw client thoughts about their product, and what they become once they've been through Ali.
export const lanes = ["Roadmap", "Sprints", "QA", "Docs"] as const;
export type Lane = (typeof lanes)[number];

export const ideaFragments: { raw: string; clean: string; lane: Lane }[] = [
  { raw: "linkedin but for media people??", clean: "B2B media marketplace", lane: "Roadmap" },
  { raw: "it has to work on phones too", clean: "Native iOS + Android", lane: "Roadmap" },
  { raw: "payments… later??", clean: "Stripe · phase 2", lane: "Roadmap" },
  { raw: "users sign up somehow", clean: "Auth + onboarding flow", lane: "Sprints" },
  { raw: "the admin thing", clean: "Admin roles & approvals", lane: "Sprints" },
  { raw: "arabic AND english", clean: "Bilingual · RTL support", lane: "Sprints" },
  { raw: "make sure nothing breaks", clean: "Testing episodes", lane: "QA" },
  { raw: "bugs everywhere?!", clean: "Severity-tagged tracker", lane: "QA" },
  { raw: "how does the team run it", clean: "120-page ops wiki", lane: "Docs" },
  { raw: "who remembers how this works", clean: "Feature specs", lane: "Docs" },
];

export const sorterStages = [
  { label: "Your product", body: "Promising. Also scattered across voice notes, screenshots and 2am messages." },
  { label: "Listen", body: "What you mean and what you wrote are two different things. I listen for both." },
  { label: "Scope", body: "The problem, named. What's in, what's out, the noise cut. If you've already scoped it, I don't redo it." },
  { label: "Structure", body: "Database first, then the logic, then the interface. Each piece finds where it belongs." },
  { label: "Clarity", body: "A plan that holds: backlog, sprints, QA and the docs." },
];


/* ------------------------------------------------------------------
   The story the home page tells, one thread: keeping what you meant.
   hero ("I build what you meant.") → 01 why (four versions, one DNA) → 02 the work →
   03 how I work (the Sorting Room) → 04 one path → 05 the protocol → 06 working together →
   07 the stack → 08 let's talk ("Tell me what you mean.").
   Ali solves the problem first, then builds the product. Never say "idea".
------------------------------------------------------------------- */
export const story = {
  hero: {
    eyebrow: "Have you met Ali?",
    // Ali speaking (Content Bank 2 and 18: "what someone actually meant, not just what they managed to put into words")
    lead: "I build what you",
    em: "meant.",
    who: "I'm Ali Farghaly",
    role: "a developer and product manager.",
    line: "I take what's in your head and make it real, from the database to the docs, without losing what you meant on the way.",
    primary: "Tell me where you are",
    secondary: "See the work",
    badge: "Open to projects",
  },
  how: {
    index: "01",
    label: "Why I work this way",
    // Ali's four-versions framework (Content Bank 3), said with "product"
    quote: "Every product exists four times. My job is to keep all four sharing the same DNA.",
    steps: ["In your head", "In your words", "In the build", "In each user's hands"],
    fade: "Pass it along carelessly and it fades at every step, like a photo forwarded on WhatsApp.",
    keep: "Pass it along with care and all four stay sharp.",
  },
  problem: { index: "03", label: "How I work", lead: "Messy in.", sort: "Clear out." },
  solution: { index: "04", label: "One path", heading: "One person, one path. Nothing gets lost in a handover.", italic: [2, 3] },
  roadmap: {
    index: "05",
    label: "The protocol",
    heading: "A protocol you can follow. A line you can track.",
    italic: [4, 9],
    // "tell Ali where you are": composes a WhatsApp or email message, nothing is stored on the site
    send: {
      eyebrow: "Tell Ali where you are",
      heading: "My product is at",
      name: "Your name",
      company: "Company (optional)",
      note: "What's going on, in one line",
      whatsapp: "Send on WhatsApp",
      email: "Send by email",
      fine: "Opens WhatsApp or your email with the message already written. Nothing is stored on this site.",
    },
  },
  together: { index: "06", label: "Working together", heading: "I give honest timelines, and I deliver on them.", italic: [2, 3] },
  proof: {
    index: "02",
    label: "The work",
    // the work filter (projects.ts categories); named like the two halves of the one path
    filters: { All: "Everything", "No-Code": "Build it", Product: "Run it" }, heading: "What I built, and every hat I wore building it.", italic: [4, 5] },
  // on /about (moved off the home page in round 7)
  person: {
    index: "About",
    label: "The path",
    // the running thread (Content Bank 1, agreed with Ali)
    lede: "The medium keeps changing: languages, then apps, then docs. The discipline stays the same: care about the input as much as the output.",
    heading: "From translator to builder to product manager.",
    italic: [2, 4, 6, 7],
  },
  stack: { index: "07", label: "The stack", heading: "Today's toolbox. Never the whole of it.", italic: [4, 5, 6] },
  // the pill that appears once the visitor reaches the roadmap (until the contact section)
  cta: { idle: "Wherever you are on the line", picked: "Start at", action: "Let's talk" },
  contact: {
    index: "08",
    label: "Let's talk",
    heading: "Tell me what you mean. I'll take it from there.",
    italic: [3, 4],
    // Ali's own closing line (Content Bank 11)
    lede: "Tell me what you're building and where it stands. The best way to get to know me, and see if I can stand behind all those words above, is a quick intro call.",
  },
  // the translator card in "The path": one word flipping between the two languages
  sameCraft: { label: "Same craft, new medium", en: "story", ar: "قصة" },
  footer: "Built with care · No problem left unsorted",
  nextCard: { lead: "Your product could", em: "be next." },
};

// The journal page (/journal)
export const journalPage = {
  eyebrow: "The journal",
  heading: "Notes from a tidy mind.",
  italic: [3, 4],
  lede: "Where the work gets reflected on: builds, systems, the road from translator to product, and the thinking in between.",
  description: "Ali's journal: the work, the journey, and the thinking in between.",
};

/** The message a visitor sends from the roadmap ("tell Ali where you are"). */
export function stationMessage(m: { name: string; company: string; station: string; n: number; total: number; joining?: string; note: string }) {
  const who = [m.name.trim() && `I'm ${m.name.trim()}`, m.company.trim() && `from ${m.company.trim()}`].filter(Boolean).join(" ");
  return [
    `Hi Ali${who ? `, ${who}` : ""}.`,
    `My product is at ${m.station} (station ${m.n} of ${m.total} on your protocol)${m.joining ? `: ${m.joining.toLowerCase()}` : ""}.`,
    m.note.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------
   The roadmap: a metro line from problem to growth. Clients see where they
   are and what's next; the branch lines show Ali can join at any station.
------------------------------------------------------------------- */
export type StationId = "discovery" | "definition" | "design" | "build" | "qa" | "launch" | "handover" | "grow";

export const roadmap = {
  lede: "Eight stations, each with something you can hold, so what you meant stays on track. Join wherever you are: the entry point doesn't matter, the process adapts.",
  stations: [
    { id: "discovery", name: "Discovery", what: "We find the real problem behind the product: who has it, how often, and what it costs them.", get: "A one-page problem statement", terms: ["Product discovery", "Stakeholder interviews", "Problem statement"] },
    { id: "definition", name: "Definition", what: "Users, scope and what success looks like. What's in and what's out, agreed up front.", get: "Scope doc and user stories", terms: ["Requirements gathering", "User stories", "MVP scope"] },
    { id: "design", name: "Design", what: "User flows, screens and the data model, worked out before anything gets built.", get: "Flows, wireframes, database schema", terms: ["UX design", "User flows", "Data modeling"] },
    { id: "build", name: "Build", what: "Milestones, database first, then the logic, then the interface, with a working version at the end of each.", get: "A product you can click every sprint", terms: ["No-code development", "Bubble.io", "Agile sprints"] },
    { id: "qa", name: "QA", what: "Structured testing episodes, so your users never meet the bugs.", get: "Test plan and a severity-tagged tracker", terms: ["QA testing", "UAT", "Bug triage"] },
    { id: "launch", name: "Launch", what: "Ship to the web and the app stores, then watch the first real users.", get: "Live on web, iOS and Android", terms: ["Go-live", "App Store release", "Monitoring"] },
    { id: "handover", name: "Handover", what: "Specs, guides and a wiki, so someone else can maintain it without me in the room.", get: "Docs your team actually reads", terms: ["Technical documentation", "SOPs", "Knowledge transfer"] },
    { id: "grow", name: "Grow", what: "Measure, learn, improve. The next problem starts the next loop.", get: "A roadmap for what's next", terms: ["Product roadmap", "Analytics", "Continuous improvement"] },
  ] as { id: StationId; name: string; what: string; get: string; terms: string[] }[],
  // where a project can join the line, and what Ali does first when it does
  joins: [
    { id: "fresh", label: "Nothing built yet", at: "discovery", color: "var(--sun)", note: "I'll scope it, structure it, and build it from scratch." },
    { id: "specs", label: "Specs ready", at: "build", color: "var(--leaf)", note: "I'll implement them faithfully, and flag anything that doesn't add up." },
    { id: "messy", label: "A previous developer left a mess", at: "qa", color: "var(--teal-bright)", note: "I've untangled that before. I map what exists and make it stable first." },
    { id: "stuck", label: "80% done, stuck", at: "launch", color: "var(--muted)", note: "I'll audit what's there and take it across the finish line." },
  ] as { id: string; label: string; at: StationId; color: string; note: string }[],
};
