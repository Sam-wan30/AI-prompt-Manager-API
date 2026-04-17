# AI Prompt Manager API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-blue?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.0-orange?style=flat-square&logo=mongoose&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)

**A production-ready AI Prompt Manager API built with Node.js, Express, and MongoDB**

[View API Documentation](#api-documentation) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Project Overview

A sophisticated REST API for managing AI prompts with advanced search capabilities, usage tracking, and analytics. This API demonstrates professional backend development practices with clean architecture, comprehensive error handling, and production-ready features.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [API Documentation](#api-documentation)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## Features

### Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete prompts with validation
- **Advanced Search**: Filter by category, tags, and text search with regex support
- **Bulk Operations**: Insert multiple prompts at once using insertMany
- **Usage Tracking**: Track prompt usage with atomic increments
- **Pagination & Sorting**: Flexible pagination with multiple sorting options

### Advanced Features
- **Production-Ready**: Rate limiting, security headers, and comprehensive error handling
- **Consistent API**: Standardized JSON response format across all endpoints
- **Analytics**: Usage statistics, popular prompts, and category breakdowns
- **Search Optimization**: MongoDB indexes for optimal search performance
- **Data Validation**: Comprehensive Mongoose schema validation

### Security & Performance
- **Rate Limiting**: Configurable request rate limits
- **Security Headers**: Helmet.js for security hardening
- **Input Validation**: Joi and Mongoose validation layers
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database Optimization**: Proper indexing and query optimization

---

## Tech Stack

| Category | Technology | Version | Description |
|----------|------------|---------|-------------|
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?style=flat-square) | 14+ | JavaScript runtime environment |
| | ![Express](https://img.shields.io/badge/Express-4.18-blue?style=flat-square) | 4.18.2 | Fast, unopinionated web framework |
| | ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=flat-square) | 6.0+ | NoSQL document database |
| | ![Mongoose](https://img.shields.io/badge/Mongoose-8.0-orange?style=flat-square) | 8.0+ | MongoDB object modeling |
| **Security** | ![Helmet](https://img.shields.io/badge/Helmet-7.1-00D64F?style=flat-square) | 7.1+ | Security middleware |
| | ![CORS](https://img.shields.io/badge/CORS-2.8-blue?style=flat-square) | 2.8+ | Cross-origin resource sharing |
| | ![Rate Limit](https://img.shields.io/badge/Rate%20Limit-7.1-red?style=flat-square) | 7.1+ | Request rate limiting |
| **Validation** | ![Joi](https://img.shields.io/badge/Joi-17.11-blue?style=flat-square) | 17.11+ | Data validation library |
| **Development** | ![Nodemon](https://img.shields.io/badge/Nodemon-3.0-green?style=flat-square) | 3.0+ | Auto-restart development tool |
| | ![Dotenv](https://img.shields.io/badge/Dotenv-16.3-ECD53F?style=flat-square) | 16.3+ | Environment variable management |

---

## API Documentation

### Base URL
```
http://localhost:3000/api/prompts
```

### Response Format
All API responses follow this consistent format:
```json
{
  "success": true|false,
  "data": {}, // Optional
  "message": "Success message" // Optional
}
```

### Endpoints

#### 1. Create a Prompt
```http
POST /api/prompts
Content-Type: application/json

{
  "title": "Code Review Assistant",
  "description": "A comprehensive prompt for reviewing code quality",
  "promptText": "Please review the following code...",
  "category": "coding",
  "tags": ["code-review", "quality", "security"]
}
```

#### 2. Get All Prompts (with pagination)
```http
GET /api/prompts?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### 3. Get Single Prompt
```http
GET /api/prompts/:id
```

#### 4. Update a Prompt
```http
PUT /api/prompts/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### 5. Delete a Prompt
```http
DELETE /api/prompts/:id
```

#### 6. Bulk Insert Prompts
```http
POST /api/prompts/bulk
Content-Type: application/json

{
  "prompts": [
    {
      "title": "Prompt 1",
      "description": "Description 1",
      "promptText": "Text 1",
      "category": "writing",
      "tags": ["tag1", "tag2"]
    },
    // ... more prompts
  ]
}
```

#### 7. Search Prompts
```http
GET /api/prompts/search?q=code&category=coding&tags=security,quality&page=1&limit=10
```

#### 8. Use a Prompt (increment usage)
```http
POST /api/prompts/:id/use
```

#### 9. Get Popular Prompts
```http
GET /api/prompts/popular?limit=10
```

#### 10. Get Statistics
```http
GET /api/prompts/stats
```

### Prompt Schema
```javascript
{
  "title": String (required, min 3 chars),
  "description": String (required, min 10 chars),
  "promptText": String (required, min 20 chars),
  "category": String (required, enum: writing, coding, marketing, business, education, creative, research, other),
  "tags": [String],
  "usageCount": Number (default: 0),
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **Git** (for cloning)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-prompt-manager-api.git
cd ai-prompt-manager-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if not already running)
mongod

# Seed with sample data (optional)
npm run seed

# Start the application
npm start
```

### Development Mode

```bash
# For development with auto-restart
npm run dev
```

---

## Usage

### Basic Workflow

1. **Start the API Server**: `npm start`
2. **Access Health Check**: `GET http://localhost:3000/api/health`
3. **Seed Sample Data**: `npm run seed`
4. **Test Endpoints**: Use Postman, curl, or any HTTP client

### Example Usage with curl

```bash
# Create a prompt
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blog Post Generator",
    "description": "Generate engaging blog posts",
    "promptText": "Write a blog post about...",
    "category": "writing",
    "tags": ["blog", "content"]
  }'

# Get all prompts
curl http://localhost:3000/api/prompts

# Search prompts
curl "http://localhost:3000/api/prompts/search?q=writing&category=writing"

# Use a prompt (increment usage)
curl -X POST http://localhost:3000/api/prompts/PROMPT_ID/use
```

---

## Project Structure

```
ai-prompt-manager-api/
|-- config/
|   |-- database.js           # MongoDB connection configuration
|-- controllers/
|   |-- promptController.js   # Business logic for prompt operations
|-- middleware/
|   |-- errorHandler.js       # Centralized error handling
|-- models/
|   |-- Prompt.js            # Mongoose schema and model
|-- routes/
|   |-- promptRoutes.js      # API route definitions
|-- .env                     # Environment variables
|-- .gitignore              # Git ignore file
|-- package.json            # Dependencies and scripts
|-- seed.js                 # Database seeder
|-- server.js               # Main application entry point
|-- README.md               # This file
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ai-prompt-manager

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Variables Description

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ai-prompt-manager` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Testing Endpoints

Use the provided seed data or create your own test data:

```bash
# Seed test data
npm run seed

# Test health endpoint
curl http://localhost:3000/api/health

# Test CRUD operations
curl -X POST http://localhost:3000/api/prompts -d '{"title":"Test","description":"Test","promptText":"Test prompt text","category":"other","tags":[]}' -H "Content-Type: application/json"
```

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards

- Follow **ESLint** configuration
- Write **meaningful commit messages**
- Add **tests** for new features
- Update **documentation** as needed
- Follow **REST API** best practices

### Bug Reports

Please use the issue tracker to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- API endpoint and payload (if applicable)

---

## Contact

### Connect With Me

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF6B6B?style=for-the-badge&logo=react&logoColor=white)](https://yourportfolio.com)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your.email@example.com)

</div>

### Project Information

- **Author**: Your Name
- **Version**: 1.0.0
- **License**: MIT License
- **Repository**: [GitHub Repository](https://github.com/yourusername/ai-prompt-manager-api)

---

<div align="center">

**Built with passion for clean, production-ready APIs**

![Heart](https://img.shields.io/badge/Made%20with%20%E2%99%A5-red?style=flat-square)

</div>
