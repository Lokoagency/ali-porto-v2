// Everything Ali says about himself lives here, so copy changes never touch components.

const ASSET = "https://bwnfyhcmekdzumndknhp.supabase.co/storage/v1/object/public/images";
export const asset = (file: string) => `${ASSET}/${file}`;

export const person = {
  name: "Ali Farghaly",
  short: "Ali",
  tagline: "No-code developer and product manager.",
  photo: asset("1771468357918-1733826677030.jpeg"),
  roles: ["No-code developer", "Product manager", "UX thinker", "Systems builder", "Documentation writer"],
  intro:
    "Building platforms from scratch. Transforming ideas from concept to launch. Designing with the user in mind and documenting everything along the way.",
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
    body: "Full-stack web apps. Native mobile apps. Admin dashboards. Complex database architectures. Bubble.io is my primary tool, but I learn fast and adapt to new platforms.",
    bullets: ["Web apps", "Native mobile", "Admin dashboards", "Database architecture"],
  },
  {
    key: "Systems" as StackCategory,
    index: "02",
    title: "Run it",
    sub: "The system around it",
    body: "Product roadmaps. Sprint planning. QA coordination. User research. The Agile frameworks, user stories, and operational systems that turn ideas into working software.",
    bullets: ["Roadmaps", "Sprints", "QA cycles", "User research"],
  },
];

// "One person, one path": the build and the system are two stops on the same line
export const onePath = {
  lede: "Most projects hire a builder and a product manager, and the idea gets lost in the handover between them. With me there's no handover: one person, one path, from the problem to a product your team can run.",
  quote: "Every product needs its own system, and I build the one that fits.",
};

// The stack: today's toolbox, not the limit. Each pair = a tool Ali knows → one it carries over to.
export const stack = {
  note: "This is today's toolbox, not the whole of it. I learn new tools every week, and the skills carry over: if I know Notion, I'm at home in Linear by the afternoon.",
  learning: [
    { knows: "Notion", next: "Linear" },
    { knows: "Bubble.io", next: "FlutterFlow" },
    { knows: "Airtable", next: "Baserow" },
    { knows: "Zapier", next: "n8n" },
    { knows: "Jira", next: "Asana" },
    { knows: "Canva", next: "Figma" },
    { knows: "Softr.io", next: "Webflow" },
    { knows: "ClickUp", next: "Monday" },
  ],
};

export const principles = [
  {
    title: "Emotional Reasoning",
    body: "Building flows and interfaces through the same lens I use in everyday life: feeling out how others might react. Anticipating friction before it becomes a bug.",
    glyph: "heart",
  },
  {
    title: "Systems Thinking",
    body: "Clean structures. Complex relational schemas. Messy metadata organized until it makes sense. Databases designed for how the product will grow, not just how it works today.",
    glyph: "nodes",
  },
  {
    title: "Expansion Instinct",
    body: "Self-taught across disciplines. I chase new tools with genuine excitement, learn fast, and fold them into my work. Bubble is my primary, but I adapt.",
    glyph: "spark",
  },
  {
    title: "Documentation",
    body: "Everything I build gets documented. Feature specs, user guides, technical notes. The next person should understand the system without calling me.",
    glyph: "doc",
  },
] as const;

export const competencies = [
  { title: "Roadmaps & Planning", body: "Breaking epics into user stories. Prioritizing on user needs and business goals. Backlogs that stay groomed and teams that stay focused." },
  { title: "User Research & QA", body: "Usability testing. Recruiting and managing remote QA teams. Structured feedback loops that turn insights into sprint-ready improvements." },
  { title: "Team Coordination", body: "Bridging product, design, and engineering. Standups and sprint reviews. Clear communication across timezones and disciplines." },
  { title: "Documentation", body: "Writing that people actually read. Specs, user guides, internal wikis. Knowledge that survives team changes." },
];

export const journey = [
  {
    years: "2017 – 2021",
    role: "Translator",
    lede: "Before I ever managed a product, I learned how to manage myself.",
    body: "Academically trained as a translator and simultaneous interpreter — B.A. from Al-Alsun Faculty, 3.7 GPA. Four years translating Arabic ↔ English: legal documents, serialized adventure stories, marketing copy. Translation taught me to understand what one side needs and make sure the other side gets it.",
  },
  {
    years: "2021 – 2023",
    role: "Builder",
    lede: "Building products felt the same as translating — just through different mediums.",
    body: "I met Bubble.io while translating for a media company in Dubai, and something clicked. A bootcamp gave me the basics; building taught me the rest. A subscription portal became dashboards, which became a full platform rebuild. By 2023 I was leading solo development on a B2B marketplace: web, iOS, Android, admin, and a complete wiki.",
  },
  {
    years: "2023 – Now",
    role: "Product Manager",
    lede: "Building is one job. Getting a product to launch and keeping it running is another.",
    body: "Now I can do either. Define the roadmap, write the specs, coordinate the sprints, run the QA, document the system. Or open Bubble and build the thing myself. Most of this work comes from three years in the mena.tv ecosystem — multiple hats, one mega product I'm proud of.",
  },
];

// Translation as a metaphor: what each old medium became.
export const translations = [
  { from: "grammar", to: "database structures" },
  { from: "tone", to: "color systems" },
  { from: "sentence rhythm", to: "user flows" },
];

export const workingStyle = [
  { title: "Morning Hours", body: "Mornings, Monday through Friday. Deep focus during those hours, offline at night. Work-life balance matters.", glyph: "sun" },
  { title: "Clear Scope", body: "What's in and what's out is defined before work starts. Changes happen — we talk about them.", glyph: "scope" },
  { title: "Honest Timelines", body: "I tell you how long things will take. If something shifts, I flag it early. No surprises.", glyph: "time" },
  { title: "Documentation", body: "Feature specs, user guides, operational wikis. The next person picks up right where I left off.", glyph: "doc" },
] as const;

// The idea sorter — raw client thoughts and what they become once they've been through Ali.
export const lanes = ["Roadmap", "Sprints", "QA", "Docs"] as const;
export type Lane = (typeof lanes)[number];

export const ideaFragments: { raw: string; clean: string; lane: Lane }[] = [
  { raw: "uber but for TV people??", clean: "B2B media marketplace", lane: "Roadmap" },
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
  { label: "Your idea", body: "Brilliant. Also scattered across voice notes, screenshots and 2am messages." },
  { label: "Listen", body: "What actually hurts? Every fragment gets heard, because the problem is hiding in there." },
  { label: "Scope", body: "The problem, named. What's in, what's out, and the noise cut, agreed up front." },
  { label: "Structure", body: "Now the solution: data, flows, edge cases. Each piece finds where it belongs." },
  { label: "Clarity", body: "A plan that solves the real problem: roadmap, sprints, QA and docs." },
];

export const stats = [
  { value: 30, suffix: "+", label: "interconnected data types in one marketplace" },
  { value: 120, suffix: "+", label: "pages of documentation the team runs on" },
  { value: 2, suffix: "", label: "app stores shipped to — iOS and Android" },
  { value: 4, suffix: " yrs", label: "translating meaning between Arabic and English" },
];

/* ------------------------------------------------------------------
   The story the home page tells, in order:
   the problem → the solution → how → the roadmap → proof → the person → let's talk.
   Ali starts with the problem behind an idea, then builds the solution.
------------------------------------------------------------------- */
export const story = {
  hero: {
    lines: ["Your idea is brilliant.", "Let's start with the"],
    word: "problem.",
    tagline: "I find what is really broken, then build what makes it",
    sort: "make sense.",
    // the notes around the portrait, in the order they line up
    notes: ["The problem", "Who has it", "What it costs", "The fix", "The build", "The docs"],
  },
  problem: { index: "01", label: "The problem", lead: "Messy in.", sort: "Clear out." },
  solution: { index: "02", label: "The solution", heading: "One person, one path: build it right, then make it run.", italic: [2, 3] },
  how: { index: "03", label: "How I build", quote: "I think like a product person, design like a UX thinker, and build with technical depth." },
  roadmap: { index: "04", label: "The roadmap", heading: "Every project is a line. Here's where you are.", italic: [6, 7, 8] },
  proof: { index: "05", label: "Proof", heading: "Problems found, solved and shipped.", italic: [2, 3, 4] },
  person: { index: "06", label: "The person", heading: "From translator to builder to product manager.", italic: [2, 4, 6, 7] },
  together: { index: "07", label: "Working together", heading: "Calm, clear, and no surprises.", italic: [3, 4] },
  // the pill that appears once the visitor reaches the roadmap (until the contact section)
  cta: { idle: "Wherever you are on the line", picked: "Start at", action: "Let's talk" },
  contact: { index: "08", label: "Let's talk", heading: "Got an idea? Let's find the problem first.", italic: [6, 7] },
};

/* ------------------------------------------------------------------
   The roadmap: a metro line from problem to growth. Clients see where they
   are and what's next; the branch lines show Ali can join at any station.
------------------------------------------------------------------- */
export type StationId = "discovery" | "definition" | "design" | "build" | "qa" | "launch" | "handover" | "grow";

export const roadmap = {
  lede: "Wherever your project is today, there's a station for it. Pick where you are and see what happens next.",
  stations: [
    { id: "discovery", name: "Discovery", what: "We find the real problem behind the idea: who has it, how often, and what it costs them.", get: "A one-page problem statement" },
    { id: "definition", name: "Definition", what: "Users, scope and what success looks like. What's in and what's out, agreed up front.", get: "Scope doc and user stories" },
    { id: "design", name: "Design", what: "User flows, screens and the data model, worked out before anything gets built.", get: "Flows, wireframes, database schema" },
    { id: "build", name: "Build", what: "Sprints in Bubble, with a working version at the end of every one.", get: "A product you can click every sprint" },
    { id: "qa", name: "QA", what: "Structured testing episodes, so your users never meet the bugs.", get: "Test plan and a severity-tagged tracker" },
    { id: "launch", name: "Launch", what: "Ship to the web and the app stores, then watch the first real users.", get: "Live on web, iOS and Android" },
    { id: "handover", name: "Handover", what: "Specs, guides and a wiki, so your team runs it without calling me.", get: "Docs your team actually reads" },
    { id: "grow", name: "Grow", what: "Measure, learn, improve. The next problem starts the next loop.", get: "A roadmap for what's next" },
  ] as { id: StationId; name: string; what: string; get: string }[],
  // where a project can join the line, and what Ali does first when it does
  joins: [
    { id: "idea", label: "Just an idea", at: "discovery", color: "var(--sun)", note: "Perfect. We start at the beginning: the problem." },
    { id: "designs", label: "Designs ready", at: "build", color: "var(--leaf)", note: "I check the designs against the problem, then we build." },
    { id: "messy", label: "Built, but messy", at: "qa", color: "var(--teal-bright)", note: "I map what exists and make it stable before adding anything new." },
    { id: "undocumented", label: "Live, undocumented", at: "handover", color: "var(--muted)", note: "I document the system so it stops depending on one person." },
  ] as { id: string; label: string; at: StationId; color: string; note: string }[],
};
