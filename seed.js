// ============================================
// AI Prompt Manager API - Database Seeder
// ============================================

const mongoose = require('mongoose');
const Prompt = require('./models/Prompt');
require('dotenv').config();

// Sample prompt data
const samplePrompts = [
  {
    title: "Code Review Assistant",
    description: "A comprehensive prompt for reviewing code quality, security, and best practices",
    promptText: "Please review the following code and provide detailed feedback on: 1) Code quality and readability 2) Security vulnerabilities 3) Performance considerations 4) Best practices adherence 5) Potential improvements. Please be specific and provide actionable suggestions.",
    category: "coding",
    tags: ["code-review", "quality", "security", "best-practices"]
  },
  {
    title: "Blog Post Generator",
    description: "Generate engaging blog posts on any topic with proper structure and SEO optimization",
    promptText: "Write a comprehensive blog post about [TOPIC] that includes: 1) An attention-grabbing title 2) A compelling introduction 3) 3-5 main sections with subheadings 4) Practical examples or case studies 5) A conclusion with call-to-action 6) SEO-optimized meta description. Make it engaging and informative.",
    category: "writing",
    tags: ["blog", "content", "seo", "marketing"]
  },
  {
    title: "Email Marketing Campaign",
    description: "Create effective email marketing campaigns with high conversion rates",
    promptText: "Design an email marketing campaign for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include: 1) Subject line options 2) Preheader text 3) Email body with personalization 4) Clear call-to-action 5) P.S. section 6) Mobile optimization considerations. Focus on conversion and engagement.",
    category: "marketing",
    tags: ["email", "campaign", "conversion", "marketing"]
  },
  {
    title: "Business Strategy Planner",
    description: "Develop comprehensive business strategies with SWOT analysis and action plans",
    promptText: "Create a detailed business strategy for [BUSINESS/PROJECT] including: 1) Executive summary 2) SWOT analysis 3) SMART goals and objectives 4) Target market analysis 5) Competitive landscape 6) Marketing and sales strategy 7) Operational plan 8) Financial projections 9) Risk assessment 10) Implementation timeline.",
    category: "business",
    tags: ["strategy", "planning", "swot", "business"]
  },
  {
    title: "Math Tutor",
    description: "Explain mathematical concepts with step-by-step solutions and examples",
    promptText: "Explain [MATH CONCEPT] in a way that's easy to understand for [GRADE/LEVEL]. Include: 1) Simple definition 2) Step-by-step explanation 3) Visual representation suggestion 4) 3 practice problems with solutions 5) Real-world applications 6) Common mistakes to avoid. Use clear, encouraging language.",
    category: "education",
    tags: ["math", "tutoring", "education", "explanation"]
  },
  {
    title: "Creative Story Starter",
    description: "Generate creative story prompts with character development and plot ideas",
    promptText: "Create a story prompt about [GENRE/THEME] that includes: 1) A compelling opening hook 2) Main character description with flaws and strengths 3) Setting details 4) Central conflict 5) Two potential plot twists 6) A theme or moral question. Make it original and thought-provoking.",
    category: "creative",
    tags: ["story", "creative", "writing", "fiction"]
  },
  {
    title: "Research Paper Outline",
    description: "Structure academic research papers with proper methodology and citations",
    promptText: "Create a comprehensive research paper outline for [TOPIC] including: 1) Abstract structure 2) Introduction with research question 3) Literature review framework 4) Methodology section 5) Data analysis approach 6) Expected results 7) Discussion points 8) Conclusion 9) References format. Follow academic standards.",
    category: "research",
    tags: ["research", "academic", "paper", "methodology"]
  },
  {
    title: "Social Media Content",
    description: "Generate engaging social media content for multiple platforms",
    promptText: "Create a week's worth of social media content for [BUSINESS/TOPIC] across multiple platforms: 1) 3 Twitter posts with hashtags 2) 2 LinkedIn professional posts 3) 2 Instagram captions with emoji suggestions 4) 1 Facebook post with engagement question 5) Content calendar suggestions 6) Best posting times. Ensure brand consistency.",
    category: "marketing",
    tags: ["social-media", "content", "marketing", "engagement"]
  },
  {
    title: "Debug Assistant",
    description: "Help identify and fix bugs in code with systematic troubleshooting",
    promptText: "Help me debug this [LANGUAGE] code issue. The problem is [DESCRIPTION]. Please analyze: 1) Potential root causes 2) Step-by-step debugging approach 3) Common pitfalls to check 4) Testing strategies 5) Solution suggestions 6) Prevention methods. Provide code examples where helpful.",
    category: "coding",
    tags: ["debugging", "troubleshooting", "code", "problem-solving"]
  },
  {
    title: "Product Description Writer",
    description: "Create compelling product descriptions that drive sales",
    promptText: "Write a persuasive product description for [PRODUCT] targeting [CUSTOMER TYPE]. Include: 1) Catchy headline 2) Key benefits (not just features) 3) Emotional appeal 4) Social proof suggestion 5) Scarcity element 6) Clear call-to-action 7) SEO keywords 8) Bullet points for scanning. Focus on value proposition.",
    category: "marketing",
    tags: ["product", "description", "sales", "copywriting"]
  }
];

// Connect to database and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing prompts
    await Prompt.deleteMany({});
    console.log('Cleared existing prompts');

    // Insert sample prompts
    const insertedPrompts = await Prompt.insertMany(samplePrompts);
    console.log(`Inserted ${insertedPrompts.length} sample prompts`);

    // Display sample of inserted prompts
    console.log('\nSample prompts inserted:');
    insertedPrompts.slice(0, 3).forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.title} (${prompt.category})`);
    });

    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Check if this file is being run directly
if (require.main === module) {
  console.log('Starting AI Prompt Manager database seeding...');
  console.log('==============================================');
  seedDatabase();
}

module.exports = { seedDatabase, samplePrompts };
