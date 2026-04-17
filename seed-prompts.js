/**
 * Sample Prompt Data Seeder
 * Inserts realistic, high-quality prompts for demonstration
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Define Prompt Schema
const PromptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  promptText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['coding', 'marketing', 'writing', 'business', 'education']
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Prompt model
const Prompt = mongoose.model('Prompt', PromptSchema);

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  },
  tier: {
    type: String,
    default: 'basic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the User model
const User = mongoose.model('User', UserSchema);

// Sample prompts data
const samplePrompts = [
  // Coding Prompts
  {
    title: "Build a Responsive React Dashboard",
    description: "Create a comprehensive dashboard with charts, tables, and real-time data updates",
    promptText: "You are a senior React developer. Build a fully responsive dashboard component using React and Tailwind CSS that includes:\n\n1. Header with user profile and navigation\n2. Sidebar with menu items\n3. Main content area with:\n   - Key metrics cards (revenue, users, orders, growth)\n   - Line chart for revenue trends\n   - Bar chart for user activity\n   - Recent transactions table\n   - Quick stats section\n\nRequirements:\n- Use React hooks (useState, useEffect)\n- Implement responsive design for mobile/tablet/desktop\n- Add loading states and error handling\n- Include hover effects and smooth transitions\n- Use modern CSS with Tailwind\n- Add data visualization with a simple chart library\n- Include search and filter functionality\n\nThe dashboard should look professional and modern, similar to analytics dashboards used by SaaS companies. Focus on clean UI, good UX patterns, and performant code structure.",
    category: "coding",
    tags: ["react", "dashboard", "responsive", "tailwind", "charts"],
    usageCount: 156
  },
  {
    title: "Implement JWT Authentication System",
    description: "Create a secure authentication system with JWT tokens, refresh tokens, and role-based access",
    promptText: "You are a backend security expert. Implement a comprehensive JWT authentication system for a Node.js/Express API with the following features:\n\n1. User Registration:\n   - Email validation\n   - Password strength requirements\n   - Account verification\n\n2. Login System:\n   - JWT access tokens (15 min expiry)\n   - Refresh tokens (7 days expiry)\n   - Rate limiting for login attempts\n\n3. Middleware:\n   - Auth middleware for protected routes\n   - Role-based access control (admin, user, moderator)\n   - Token validation and refresh\n\n4. Security Features:\n   - Password hashing with bcrypt\n   - Input sanitization and validation\n   - CSRF protection\n   - Rate limiting\n   - Account lockout after failed attempts\n\n5. API Endpoints:\n   - POST /api/auth/register\n   - POST /api/auth/login\n   - POST /api/auth/refresh\n   - POST /api/auth/logout\n   - GET /api/auth/profile\n\nInclude error handling, logging, and follow security best practices. The code should be production-ready with proper error messages and status codes.",
    category: "coding",
    tags: ["jwt", "authentication", "security", "nodejs", "express"],
    usageCount: 89
  },
  {
    title: "Create RESTful API with MongoDB",
    description: "Design and implement a complete RESTful API with CRUD operations, validation, and pagination",
    promptText: "You are a full-stack developer. Create a complete RESTful API for a task management system using Node.js, Express, and MongoDB with the following specifications:\n\n1. Database Schema:\n   - Tasks: title, description, status, priority, dueDate, assignedTo, createdAt, updatedAt\n   - Users: name, email, role, department\n   - Projects: name, description, startDate, endDate, teamMembers\n\n2. API Endpoints:\n   - GET /api/tasks (with pagination, filtering, sorting)\n   - POST /api/tasks (with validation)\n   - PUT /api/tasks/:id (partial updates)\n   - DELETE /api/tasks/:id (soft delete)\n   - GET /api/users\n   - GET /api/projects/:id/tasks\n\n3. Features:\n   - Input validation using Joi or express-validator\n   - Error handling with proper HTTP status codes\n   - Pagination (page, limit, total, totalPages)\n   - Search and filtering (by status, priority, assignee)\n   - Sorting (by date, priority, title)\n   - Population of related documents\n   - Aggregation pipelines for analytics\n\n4. Best Practices:\n   - Use async/await properly\n   - Implement proper error handling\n   - Add request logging\n   - Use environment variables for configuration\n   - Include API documentation with swagger\n   - Add unit tests for critical functions\n\nThe code should be well-structured, maintainable, and follow REST principles.",
    category: "coding",
    tags: ["rest-api", "mongodb", "nodejs", "express", "crud"],
    usageCount: 134
  },

  // Marketing Prompts
  {
    title: "Write Viral LinkedIn Post Template",
    description: "Create a compelling LinkedIn post template that drives engagement and shares",
    promptText: "You are a social media marketing expert. Write a viral LinkedIn post template that professionals can adapt for their own content. The template should include:\n\n1. Hook Structure:\n   - Opening line that grabs attention\n   - Storytelling element or surprising statistic\n   - Personal experience or case study\n\n2. Main Content:\n   - 3-5 key points with actionable insights\n   - Data-backed claims or industry trends\n   - Practical examples or real-world applications\n   - Contrarian view or unique perspective\n\n3. Engagement Elements:\n   - Question to encourage comments\n   - Call-to-action for shares/saves\n   - Relevant hashtags (3-5 max)\n   - Tagging strategy for maximum reach\n\n4. Formatting:\n   - White space for readability\n   - Emoji usage for visual appeal\n   - Bullet points or numbered lists\n   - Bold text for emphasis\n\n5. Tone:\n   - Professional yet conversational\n   - Authoritative but approachable\n   - Value-driven, not salesy\n   - Authentic and relatable\n\nProvide 3 variations for different industries (tech, healthcare, finance) and explain the psychology behind why each element drives engagement.",
    category: "marketing",
    tags: ["linkedin", "social-media", "content-marketing", "engagement", "template"],
    usageCount: 203
  },
  {
    title: "Create Email Marketing Campaign",
    description: "Design a complete email marketing campaign with subject lines, copy, and CTAs",
    promptText: "You are an email marketing specialist. Create a comprehensive email marketing campaign for a SaaS product launch with the following components:\n\n1. Campaign Strategy:\n   - Target audience definition\n   - Campaign goals and KPIs\n   - Email sequence (5 emails over 2 weeks)\n   - Segmentation strategy\n\n2. Email #1: Teaser/Pre-launch\n   - Subject line options (A/B test)\n   - Preview text optimization\n   - Early bird offer announcement\n   - Social proof and testimonials\n\n3. Email #2: Launch Day\n   - Product announcement\n   - Feature highlights with benefits\n   - Pricing and special offer\n   - Urgency elements\n\n4. Email #3: Feature Deep Dive\n   - Detailed explanation of key features\n   - Use cases and success stories\n   - Demo video integration\n   - FAQ section\n\n5. Email #4: Social Proof\n   - Customer testimonials\n   - Case studies and results\n   - Influencer endorsements\n   - Community highlights\n\n6. Email #5: Last Chance\n   - Scarcity and urgency\n   - Final reminder of benefits\n   - Overcoming objections\n   - Clear call-to-action\n\nFor each email include:\n- 3 subject line variations\n- Mobile-responsive design\n- Personalization tokens\n- Clear CTAs with heat maps\n- Optimal send times\n- Spam score optimization\n\nFocus on conversion optimization while maintaining brand voice and providing value.",
    category: "marketing",
    tags: ["email-marketing", "campaign", "saas", "conversion", "automation"],
    usageCount: 178
  },
  {
    title: "Develop Content Marketing Strategy",
    description: "Create a comprehensive content marketing strategy with blog posts, videos, and social media",
    promptText: "You are a content marketing strategist. Develop a comprehensive 90-day content marketing strategy for a B2B tech startup with the following elements:\n\n1. Content Pillars:\n   - 3-5 core topics based on customer pain points\n   - Keyword research and SEO opportunities\n   - Competitive content gap analysis\n   - Thought leadership positioning\n\n2. Content Calendar:\n   - Weekly content schedule\n   - Content mix (blog, video, podcast, infographics)\n   - Seasonal and industry event integration\n   - Repurposing strategy\n\n3. Blog Content Strategy:\n   - 12 blog post topics with outlines\n   - SEO-optimized titles and meta descriptions\n   - Internal linking strategy\n   - Guest posting opportunities\n\n4. Video Content:\n   - YouTube channel content plan\n   - Short-form video for TikTok/Reels\n   - Webinar series schedule\n   - Video SEO optimization\n\n5. Social Media:\n   - Platform-specific content for LinkedIn, Twitter, Instagram\n   - Community management plan\n   - User-generated content strategy\n   - Influencer collaboration plan\n\n6. Distribution Strategy:\n   - Email newsletter integration\n   - Social media promotion schedule\n   - Paid amplification plan\n   - Content syndication partnerships\n\n7. Metrics and KPIs:\n   - Traffic and engagement goals\n   - Lead generation targets\n   - Conversion rate optimization\n   - Brand awareness metrics\n\nInclude content templates, editorial calendar template, and measurement dashboard design.",
    category: "marketing",
    tags: ["content-marketing", "strategy", "seo", "social-media", "analytics"],
    usageCount: 145
  },

  // Writing Prompts
  {
    title: "Write Compelling Product Description",
    description: "Create persuasive product descriptions that convert visitors into customers",
    promptText: "You are a professional copywriter specializing in e-commerce. Write compelling product descriptions that drive conversions. Create templates and examples for different product types:\n\n1. Technical Product (Software/App):\n   - Problem-solution framework\n   - Feature-benefit translation\n   - Social proof integration\n   - Risk reversal elements\n\n2. Physical Product (Consumer Goods):\n   - Sensory language and vivid imagery\n   - Lifestyle integration scenarios\n   - Quality and craftsmanship details\n   - Emotional connection points\n\n3. Service-Based Product:\n   - Process explanation\n   - Results and outcomes focus\n   - Expertise and authority building\n   - Trust and credibility elements\n\nFor each type include:\n- Headline formulas (5 variations)\n- Opening hooks that grab attention\n- Bullet point benefits vs features\n- Storytelling elements\n- Scarcity and urgency techniques\n- Call-to-action optimization\n- Price justification strategies\n\nAlso provide:\n- A/B testing framework for descriptions\n- SEO keyword integration without sounding robotic\n- Mobile formatting best practices\n- Trust signals and credibility markers\n- Common mistakes to avoid\n\nThe descriptions should be persuasive, authentic, and focused on customer benefits rather than just features.",
    category: "writing",
    tags: ["copywriting", "product-description", "ecommerce", "conversion", "persuasion"],
    usageCount: 167
  },
  {
    title: "Create Blog Post Outline Template",
    description: "Develop a comprehensive blog post outline template that engages readers and ranks well",
    promptText: "You are a content strategist and SEO expert. Create a comprehensive blog post outline template that ensures high engagement and search rankings. The template should include:\n\n1. Pre-Writing Research:\n   - Keyword research and intent analysis\n   - Competitor content analysis\n   - Target audience pain points\n   - Content gap identification\n\n2. Blog Post Structure:\n   - Compelling title formulas (10 variations)\n   - Meta description optimization\n   - Introduction hooks (5 types)\n   - Table of contents for long-form content\n\n3. Body Content Framework:\n   - H2/H3 heading structure\n   - Paragraph length optimization\n   - Bullet point and numbered list usage\n   - Image and media integration\n   - Internal linking strategy\n\n4. Engagement Elements:\n   - Question prompts throughout\n   - Interactive elements (polls, quizzes)\n   - Comment section optimization\n   - Social sharing integration\n\n5. SEO Elements:\n   - Keyword density and placement\n   - LSI keyword integration\n   - Schema markup opportunities\n   - Readability optimization\n\n6. Conclusion and CTA:\n   - Summary frameworks\n   - Call-to-action variations\n   - Related content suggestions\n   - Newsletter signup integration\n\n7. Content Types:\n   - How-to guides\n   - Listicles\n   - Case studies\n   - Opinion pieces\n   - Resource roundups\n\nProvide specific examples for different industries and explain the psychology behind each element. Include a checklist for optimizing published content.",
    category: "writing",
    tags: ["blogging", "seo", "content-strategy", "outline", "engagement"],
    usageCount: 192
  },
  {
    title: "Write Press Release Template",
    description: "Create professional press release templates that get media coverage and attention",
    promptText: "You are a PR professional with experience getting coverage in major publications. Create comprehensive press release templates for different scenarios:\n\n1. Product Launch Press Release:\n   - Headline formulas that grab journalist attention\n   - Subtitle and dateline format\n   - Lead paragraph with 5W's\n   - Product details and benefits\n   - Quotes from executives and customers\n   - Company background boilerplate\n   - Contact information and media kit\n\n2. Funding Announcement:\n   - Investment amount and investors\n   - Growth metrics and milestones\n   - Market opportunity and vision\n   - Team backgrounds and expertise\n   - Future plans and roadmap\n\n3. Partnership/Collaboration:\n   - Partnership details and benefits\n   - Market impact and significance\n   - Quotes from both parties\n   - Implementation timeline\n\n4. Research/Study Results:\n   - Key findings and statistics\n   - Methodology explanation\n   - Industry implications\n   - Expert commentary\n\n5. Award/Recognition:\n   - Award details and significance\n   - Selection criteria\n   - Company achievement context\n   - Future impact statement\n\nFor each template include:\n- Distribution strategy (wire services, targeted outreach)\n- Timing considerations\n- Follow-up protocols\n- Measurement and tracking\n- Common mistakes to avoid\n- Journalist relationship building\n\nAlso provide media contact best practices, image and multimedia integration, and crisis communication considerations.",
    category: "writing",
    tags: ["press-release", "pr", "media-coverage", "communications", "template"],
    usageCount: 98
  },

  // Business Prompts
  {
    title: "Create Business Startup Idea Generator",
    description: "Generate innovative startup ideas with market validation and business model canvas",
    promptText: "You are a venture capitalist and startup advisor. Create a comprehensive startup idea generator that produces validated business concepts. The generator should include:\n\n1. Idea Generation Framework:\n   - Problem identification methodology\n   - Market trend analysis\n   - Technology opportunity mapping\n   - Customer pain point discovery\n   - Industry disruption opportunities\n\n2. Validation Checklist:\n   - Market size assessment (TAM, SAM, SOM)\n   - Competitive landscape analysis\n   - Revenue model viability\n   - Scalability evaluation\n   - Resource requirements\n\n3. Business Model Canvas:\n   - Value proposition design\n   - Customer segments and channels\n   - Revenue streams and cost structure\n   - Key partnerships and activities\n   - Key resources and relationships\n\n4. Startup Idea Categories:\n   - SaaS and software solutions\n   - E-commerce and marketplace\n   - FinTech and payments\n   - HealthTech and wellness\n   - EdTech and learning\n   - CleanTech and sustainability\n   - AI and machine learning\n   - Future of work\n\n5. Idea Examples:\n   Generate 10 specific startup ideas including:\n   - Problem statement\n   - Solution overview\n   - Target market\n   - Business model\n   - Competitive advantage\n   - Launch strategy\n   - Funding requirements\n   - Risk factors\n\n6. Evaluation Framework:\n   - Scoring system for ideas (1-10)\n   - Go/no-go decision criteria\n   - Pivot opportunities\n   - MVP definition\n\nProvide a step-by-step process for entrepreneurs to use this generator, including research methods and validation techniques.",
    category: "business",
    tags: ["startup", "business-ideas", "entrepreneurship", "innovation", "validation"],
    usageCount: 234
  },
  {
    title: "Develop Financial Model Template",
    description: "Create comprehensive financial projections and business model for startups and small businesses",
    promptText: "You are a CFO and financial analyst. Create a comprehensive financial model template for startups that includes:\n\n1. Revenue Model:\n   - Revenue streams (subscription, one-time, usage-based)\n   - Pricing strategy and tiers\n   - Customer acquisition assumptions\n   - Churn rate and retention\n   - Expansion revenue opportunities\n\n2. Cost Structure:\n   - Fixed costs (rent, salaries, software)\n   - Variable costs (marketing, sales commissions)\n   - COGS and gross margins\n   - Operating expenses breakdown\n   - Capital expenditures\n\n3. Financial Statements:\n   - Income statement (P&L) - 3 years monthly\n   - Balance sheet - 3 years quarterly\n   - Cash flow statement - 3 years monthly\n   - Statement of changes in equity\n\n4. Key Metrics Dashboard:\n   - Monthly recurring revenue (MRR)\n   - Annual recurring revenue (ARR)\n   - Customer acquisition cost (CAC)\n   - Lifetime value (LTV)\n   - LTV/CAC ratio\n   - Burn rate and runway\n   - Gross margin and net margin\n   - EBITDA and free cash flow\n\n5. Scenario Analysis:\n   - Base case, best case, worst case\n   - Sensitivity analysis\n   - Break-even analysis\n   - Funding requirements and timing\n\n6. Assumptions Documentation:\n   - Market size and growth rates\n   - Conversion rates and funnels\n   - Pricing changes and inflation\n   - Hiring plans and productivity\n\n7. Investor Presentation:\n   - Executive summary\n   - Financial highlights\n   - Growth projections\n   - Funding ask and use of proceeds\n\nProvide Excel/Google Sheets templates with formulas, charts, and automation. Include industry benchmarks and validation methods.",
    category: "business",
    tags: ["financial-model", "startup", "projections", "metrics", "funding"],
    usageCount: 176
  },
  {
    title: "Create Go-to-Market Strategy",
    description: "Develop comprehensive GTM strategy for product launches and market expansion",
    promptText: "You are a go-to-market strategist with experience launching products at major tech companies. Create a comprehensive GTM strategy framework that includes:\n\n1. Market Analysis:\n   - Total addressable market (TAM)\n   - Ideal customer profile (ICP)\n   - Buyer personas and user personas\n   - Competitive positioning\n   - Market timing and readiness\n\n2. Product Positioning:\n   - Value proposition articulation\n   - Messaging framework\n   - Differentiation strategy\n   - Pricing and packaging\n   - Competitive advantage\n\n3. Launch Strategy:\n   - Phased rollout approach\n   - Beta program design\n   - Early adopter acquisition\n   - PR and media strategy\n   - Launch event planning\n\n4. Sales Strategy:\n   - Sales model (direct, channel, self-serve)\n   - Sales process and methodology\n   - Compensation and incentives\n   - Sales enablement materials\n   - CRM and sales tech stack\n\n5. Marketing Strategy:\n   - Demand generation plan\n   - Content marketing calendar\n   - Account-based marketing (ABM)\n   - Digital marketing mix\n   - Budget allocation and ROI\n\n6. Customer Success:\n   - Onboarding process\n   - Customer journey mapping\n   - Retention and expansion\n   - Advocacy and referrals\n   - Support and training\n\n7. Metrics and KPIs:\n   - Leading indicators (MQLs, SQLs, pipeline)\n   - Lagging indicators (revenue, market share)\n   - Customer metrics (satisfaction, NPS, churn)\n   - Operational metrics (CAC, LTV, payback period)\n\n8. Timeline and Resources:\n   - 90-day launch plan\n   - Team structure and roles\n   - Budget requirements\n   - Technology and tools needed\n\nProvide templates, checklists, and real-world examples for B2B SaaS, B2C, and marketplace models.",
    category: "business",
    tags: ["go-to-market", "strategy", "launch", "sales", "marketing"],
    usageCount: 189
  },

  // Education Prompts
  {
    title: "Explain DSA Concepts Simply",
    description: "Break down complex data structures and algorithms into simple, understandable explanations",
    promptText: "You are an expert computer science educator who excels at making complex concepts simple. Create comprehensive explanations for fundamental DSA concepts that a beginner can understand:\n\n1. Data Structures:\n   - Arrays: When to use, pros/cons, real-world examples\n   - Linked Lists: Singly, doubly, circular with visual analogies\n   - Stacks and Queues: Everyday examples and use cases\n   - Trees: Binary trees, BST, with family tree analogy\n   - Graphs: Social networks, navigation, recommendation systems\n   - Hash Tables: Dictionary analogy, collision resolution\n\n2. Algorithms:\n   - Sorting: Bubble, Quick, Merge with sorting cards analogy\n   - Searching: Linear vs Binary with phone book example\n   - Recursion: Russian dolls, solving problems by breaking down\n   - Dynamic Programming: Fibonacci with memoization\n   - Greedy Algorithms: Making locally optimal choices\n   - Graph Traversal: BFS/DFS with maze exploration\n\n3. For each concept include:\n   - Simple real-world analogy\n   - Visual description or diagram\n   - Step-by-step explanation\n   - Code example with comments\n   - Time and space complexity in simple terms\n   - When to use vs when not to use\n   - Common mistakes and pitfalls\n   - Practice problems with solutions\n\n4. Teaching Methodology:\n   - Start with why (motivation)\n   - Use storytelling and analogies\n   - Provide visual mental models\n   - Build from simple to complex\n   - Include interactive elements\n   - Use multiple learning styles\n\n5. Learning Path:\n   - Suggested order of learning\n   - Prerequisites for each topic\n   - Practice problems by difficulty\n   - Projects to reinforce learning\n   - Resources for deeper study\n\nMake the explanations engaging, memorable, and suitable for self-study. Include mnemonics and memory tricks for retention.",
    category: "education",
    tags: ["dsa", "algorithms", "data-structures", "programming", "tutorial"],
    usageCount: 267
  },
  {
    title: "Create Coding Interview Preparation Guide",
    description: "Comprehensive guide for technical interviews with problem-solving strategies and practice plans",
    promptText: "You are a senior software engineer who has conducted hundreds of technical interviews. Create a comprehensive coding interview preparation guide:\n\n1. Interview Process Overview:\n   - Phone screen expectations\n   - Technical rounds format\n   - System design interviews\n   - Behavioral interviews\n   - On-site interview flow\n\n2. Core Topics to Master:\n   - Data Structures: Arrays, Linked Lists, Trees, Graphs, Hash Tables\n   - Algorithms: Sorting, Searching, Recursion, DP, Greedy\n   - System Design: Scalability, Databases, Caching, Load Balancing\n   - Language Fundamentals: OOP, Memory Management, Concurrency\n\n3. Problem-Solving Framework:\n   - Understanding the problem (clarify questions)\n   - Brute force approach first\n   - Optimizing step by step\n   - Edge cases and validation\n   - Communication during coding\n\n4. Practice Strategy:\n   - 30-day study plan\n   - Daily problem schedule\n   - Difficulty progression\n   - Topic-wise practice\n   - Mock interviews\n\n5. Common Question Types:\n   - Array manipulation problems\n   - String processing and validation\n   - Tree traversal and modification\n   - Graph algorithms and shortest paths\n   - Dynamic programming patterns\n   - System design templates\n\n6. Communication Skills:\n   - Explaining your approach\n   - Asking clarifying questions\n   - Discussing trade-offs\n   - Handling hints and feedback\n   - Time and space complexity analysis\n\n7. Red Flags to Avoid:\n   - Jumping into coding without understanding\n   - Not considering edge cases\n   - Poor variable naming\n   - Not testing your solution\n   - Giving up too easily\n\n8. Day-of-Interview Tips:\n   - Mental preparation\n   - Environment setup\n   - Questions to ask the interviewer\n   - Follow-up best practices\n\nInclude specific problem examples with solutions, time management strategies, and confidence-building techniques.",
    category: "education",
    tags: ["interview", "coding", "preparation", "technical", "practice"],
    usageCount: 312
  },
  {
    title: "Design Online Course Curriculum",
    description: "Create comprehensive online course structure with learning objectives and engagement strategies",
    promptText: "You are an instructional designer with experience creating successful online courses. Design a comprehensive 12-week online course curriculum that maximizes student engagement and learning outcomes:\n\n1. Course Foundation:\n   - Learning objectives and outcomes\n   - Target audience analysis\n   - Prerequisites and skill level\n   - Course structure and pacing\n   - Assessment strategy\n\n2. Weekly Structure Template:\n   - Learning objectives for each week\n   - Core content delivery methods\n   - Interactive activities and exercises\n   - Practical assignments and projects\n   - Knowledge checks and quizzes\n   - Discussion prompts and peer interaction\n\n3. Content Delivery Methods:\n   - Video lecture best practices (5-10 minute segments)\n   - Interactive demonstrations and tutorials\n   - Reading materials and resources\n   - Case studies and real-world examples\n   - Live sessions and Q&A\n   - Office hours and support\n\n4. Student Engagement:\n   - Community building strategies\n   - Gamification elements\n   - Progress tracking and milestones\n   - Peer review and collaboration\n   - Motivation and retention techniques\n\n5. Assessment Design:\n   - Formative assessments (weekly quizzes)\n   - Summative assessments (projects, exams)\n   - Rubrics and evaluation criteria\n   - Feedback mechanisms\n   - Self-assessment opportunities\n\n6. Technology Integration:\n   - Learning Management System setup\n   - Interactive tools and platforms\n   - Multimedia resources\n   - Mobile optimization\n   - Accessibility considerations\n\n7. Course Topics (Example: Web Development):\n   Week 1: HTML & CSS Fundamentals\n   Week 2: JavaScript Basics\n   Week 3: DOM Manipulation\n   Week 4: Responsive Design\n   Week 5: JavaScript Functions & Objects\n   Week 6: APIs and Fetching Data\n   Week 7: Modern JavaScript (ES6+)\n   Week 8: React Fundamentals\n   Week 9: State Management\n   Week 10: Routing and Navigation\n   Week 11: Backend Integration\n   Week 12: Capstone Project\n\n8. Success Metrics:\n   - Completion rates\n   - Student satisfaction\n   - Learning outcome achievement\n   - Post-course success\n\nProvide templates for each component and explain the pedagogical reasoning behind design decisions.",
    category: "education",
    tags: ["course-design", "curriculum", "online-learning", "instructional-design", "engagement"],
    usageCount: 143
  }
];

// Connect to database and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-manager');
    console.log('Connected to MongoDB');

    // Create or get a demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    
    if (!demoUser) {
      demoUser = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123456', // In production, this would be hashed
        role: 'user',
        tier: 'basic'
      });
      await demoUser.save();
      console.log('Created demo user');
    } else {
      console.log('Using existing demo user');
    }

    // Clear existing prompts
    await Prompt.deleteMany({});
    console.log('Cleared existing prompts');

    // Add userId to all sample prompts
    const promptsWithUser = samplePrompts.map(prompt => ({
      ...prompt,
      userId: demoUser._id
    }));

    // Insert sample prompts
    const insertedPrompts = await Prompt.insertMany(promptsWithUser);
    console.log(`Inserted ${insertedPrompts.length} sample prompts`);

    // Display inserted prompts
    console.log('\n=== Sample Prompts Inserted ===');
    insertedPrompts.forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.title} (${prompt.category}) - Usage: ${prompt.usageCount}`);
    });

    // Show category breakdown
    const categoryBreakdown = {};
    insertedPrompts.forEach(prompt => {
      categoryBreakdown[prompt.category] = (categoryBreakdown[prompt.category] || 0) + 1;
    });
    
    console.log('\n=== Category Breakdown ===');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`${category}: ${count} prompts`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
