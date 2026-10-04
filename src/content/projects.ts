import { asset } from "./site";

export type ProjectCategory = "No-Code" | "Product";
export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  status: "Live" | "Private" | "Obsolete";
  summary: string;
  header: string;
  story: string[];
  tools: string[];
  link?: string;
  ecosystem?: string;
  thumbnail: string;
  screenshots: string[];
  /** portrait screenshots render in a phone frame */
  device?: "phone";
};

export const projects: Project[] = [
  {
    slug: "b2b-media-marketplace",
    name: "B2B Media Marketplace & Social Platform",
    category: "No-Code",
    status: "Live",
    summary: "A marketplace connecting media professionals across the Middle East. Web app and native mobile apps, built entirely in Bubble.io.",
    header:
      "A platform where content distributors, broadcasters, and production companies discover each other, list their content, and network. Users browse TV shows and films, follow companies and professionals, read industry news, and message each other directly.",
    story: [
      "Database architecture with 30+ interconnected data types. Users, companies, content listings, news articles, messages, engagement data. All connected with proper relationships designed for scale.",
      "Multi-step submission wizards for content listings. Company profiles with team management and approval workflows. Advanced search with filters for genre, language, country, and availability. News feed with social engagement. Real-time messaging between users.",
      "Full bilingual support: English and Arabic with right-to-left text handling throughout.",
      "Native iOS and Android apps deployed to both app stores. Same backend, optimized for mobile. Touch navigation, push notifications, mobile-specific interface.",
      "API integrations: Stripe for payments, Brevo for email automation, OpenAI for content tagging and moderation assistance.",
    ],
    tools: ["Bubble.io", "Stripe", "Brevo", "OpenAI API", "Airtable", "Canva"],
    link: "https://www.mena.tv",
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771467278323-mw-home.png"),
    screenshots: [
      asset("1771467298163-mw-home.png"),
      asset("1771467305757-mw-filtered-content.png"),
      asset("1771467316683-mw-listting-wizard-with-directory-bg.png"),
      asset("1771467325510-mw-news.png"),
      asset("1771467330809-mw-universal-search-with-news-bg.png"),
      asset("1771467338014-mw-user-dashboard-with-messenger.png"),
    ],
  },
  {
    slug: "admin-dashboard",
    name: "Admin Dashboard",
    category: "No-Code",
    status: "Private",
    summary: "Internal operations dashboard for managing users, companies, content, and moderation. Built for non-technical teams.",
    header:
      "A control center for platform operations. User verification, company approvals, content moderation, news publishing, CRM sync. Everything an operations team needs to run a B2B marketplace with user-generated content.",
    story: [
      "User management with search, filtering, profile editing, and CRM sync. OTP recovery flows. Magic Link authentication for stuck users. Email deliverability checks via API. Internal notes for tracking conversations.",
      "Company approval workflows with multiple status stages. Role-based permissions: Super Admin, Company Admin, Guest Admin. Team member assignment. Bilingual company profiles.",
      "Content moderation with listing approval, promotion controls, homepage featuring, carousel placement.",
      "News publishing with a rich text editor, scheduled publishing, and push notifications via OneSignal. A return-for-edits flow for user-submitted content.",
      "Overview dashboard with registration trends, geographic distribution, demographic breakdowns, and priority queues for items needing attention.",
      "All user data, metrics, and company information shown in screenshots are sample data.",
    ],
    tools: ["Bubble.io", "Brevo", "OneSignal"],
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771467108808-ad-overview-tab-4.png"),
    screenshots: [
      asset("1771467218473-ad-overview-tab-4.png"),
      asset("1771467225935-ad-overview-tab.png"),
      asset("1771467231881-ad-all-users-tab.png"),
      asset("1771467235110-ad-user-expanded-3.png"),
      asset("1771467251556-ad-companies-expanded.png"),
      asset("1771467256203-ad-news-expanded.png"),
    ],
  },
  {
    slug: "native-mobile-app",
    name: "Native Mobile App",
    category: "No-Code",
    status: "Live",
    summary: "Native iOS and Android app built with Bubble's BDK plugin. Full feature parity with the web platform.",
    header:
      "A native mobile app for a B2B media marketplace, deployed to both the App Store and Google Play. Same backend as the web app, a different interface optimized for touch and smaller screens.",
    story: [
      "User profiles with follow functionality and connection requests. Content discovery with genre, language, and country filters. News feed with endless scroll, likes, comments, shares. Direct messaging with real-time updates. Push notifications for new messages and activity.",
      "Designed the mobile interface directly in Bubble without mockups. Tested on real devices throughout development. Mobile-first patterns for touch targets, scrolling behavior, and navigation.",
    ],
    tools: ["Bubble.io", "BDK", "OneSignal"],
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771467486568-ma-mockups.png"),
    device: "phone",
    screenshots: [
      asset("1771467529980-ma-home3.png"),
      asset("1771467538221-ma-home-2.jpg"),
      asset("1771467551502-ma-directory.jpeg"),
      asset("1771467556643-ma-directory-with-filters.jpeg"),
      asset("1771467564787-ma-user-profile.jpg"),
      asset("1771467571481-ma-messenger-2.jpg"),
    ],
  },
  {
    slug: "product-backlogs",
    name: "Product Backlogs",
    category: "Product",
    status: "Private",
    summary: "Interconnected Airtable bases for product operations. Roadmap, sprint planning, bug tracking, QA coordination, CRM.",
    header:
      "A system of interconnected Airtable bases that tracked an entire product lifecycle, designed for a platform rebuild with web and mobile apps shipping simultaneously.",
    story: [
      "Product roadmap with epics broken into user stories. Each story mapped to specific features, pages, and components. Progress tracked across the whole product.",
      "Sprint planning with Kanban-style task management. Features moving from first scope through development to completion, with clear ownership at every stage.",
      "Bug tracking with screenshots, reproduction steps, platform tags (iOS, Android, Website), and severity levels, linked to the features they affected.",
      "QA coordination with testing episodes organized by platform area. Results tracked across cycles. Gamified feedback collection to keep testers engaged.",
      "Multiple views for different needs: Kanban boards for daily work, timelines for planning, grids for bulk operations.",
    ],
    tools: ["Airtable", "Nifty"],
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771467796348-at-roadmap.png"),
    screenshots: [
      asset("1771467846207-at-task-kanban.png"),
      asset("1771467851384-at-epics.png"),
      asset("1771467862735-at-roadmap.png"),
      asset("1771467867502-nifty.png"),
    ],
  },
  {
    slug: "qa-coordination",
    name: "QA Coordination",
    category: "Product",
    status: "Private",
    summary: "Structured beta testing with remote QA teams. Testing episodes, feedback channels, bug resolution workflows.",
    header:
      "A QA system for launching a platform with web and native mobile apps. Recruited and managed remote testers. Ran structured testing cycles. Resolved every critical bug before launch.",
    story: [
      "Testing episodes focused on specific platform areas (profile flows, content submission, company pages, news interactions), with clear scenarios telling testers exactly what to look for.",
      "Feedback channels built directly into the platform. Bug reports with screenshots and reproduction steps, plus functionality-specific feedback tied to scenarios.",
      "Gamified engagement with point systems, progress indicators, and recognition for thorough testing. Testers stayed engaged across multiple cycles.",
      "Bug resolution in Airtable. Every issue documented with severity tags, affected platforms, and status. Nothing lost in scattered messages.",
    ],
    tools: ["Airtable", "Bubble.io"],
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771467994856-at-testing-episodes.png"),
    screenshots: [
      asset("1771468008851-at-testing-episodes.png"),
      asset("1771468021262-at-fake-bug-tracker.png"),
      asset("1771468031210-at-bug-resolving.png"),
      asset("1771468043078-at-ali-s-tasks-bubble-elements.png"),
      asset("1771468051381-at-ali-s-dev-tasks.png"),
    ],
  },
  {
    slug: "mena-tv-wiki",
    name: "mena.tv Wiki",
    category: "Product",
    status: "Private",
    summary: "A 120+ page internal documentation system. Operations, onboarding, technical architecture, maintenance.",
    header:
      "A knowledge base built so the team could operate independently. User guides, admin procedures, technical documentation, troubleshooting guides.",
    story: [
      "User guides with step-by-step walkthroughs of every feature, written for someone who has never seen the platform.",
      "Team onboarding: how the platform is structured, how data flows between systems, what each admin tool does and when to use it.",
      "Technical documentation covering database architecture, API integrations, workflow logic, and deployment procedures.",
      "Troubleshooting guides for common issues, known limitations, and what to do when things go wrong.",
      "Organized in Notion with a clear structure. The team operates the platform without needing me. That was the goal.",
    ],
    tools: ["Notion", "ChatGPT"],
    ecosystem: "mena.tv ecosystem",
    thumbnail: asset("1771468114797-wiki-home.jpg"),
    screenshots: [
      asset("1771468125249-wiki-home.jpg"),
      asset("1771468141529-wiki-super-admin-dashboard.png"),
      asset("1771468147958-wiki-onboarding.png"),
      asset("1771468158670-wiki-common-how-tos.png"),
      asset("1771468168351-wiki-welcome-to-mena.tv.png"),
    ],
  },
  {
    slug: "analytics-subscription-portal",
    name: "Analytics Subscription Portal",
    category: "No-Code",
    status: "Obsolete",
    summary: "Subscription portal for TV viewership analytics. My first Bubble.io project.",
    header:
      "A subscription service delivering seasonal TV viewership reports to broadcasters and advertisers. Clients subscribe to analytics packages, download reports, and manage their accounts.",
    story: [
      "Subscription management with multiple access tiers and payment flows. Client dashboard for downloading reports and viewing historical data. Marketing pages with product explainers and signup flows.",
      "My first Bubble.io project. I learned the platform from scratch by building it: database design, workflow logic, authentication, responsive layouts. The fundamentals I'd use on every project after.",
    ],
    tools: ["Bubble.io", "Zapier"],
    thumbnail: asset("1771468290181-ia-1.png"),
    screenshots: [
      asset("1771468293930-ia-1.png"),
      asset("1771468303148-ia-3.png"),
      asset("1771468309016-ia-2.png"),
      asset("1771468311818-ia-4.png"),
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
