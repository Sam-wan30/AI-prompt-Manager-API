# AI Prompt Manager - Frontend

A modern, production-ready SaaS dashboard built with React, Vite, and Tailwind CSS for managing AI prompts with OpenAI integration.

## Features

### Authentication
- JWT-based authentication with localStorage
- Login and registration pages
- Protected routes with automatic redirect
- User profile management

### Dashboard
- Real-time statistics and analytics
- Most used prompts display
- Category summaries
- Recent activity tracking
- Quick action buttons

### Prompt Management
- Create, read, update, delete prompts
- Advanced search and filtering
- Category and tag-based organization
- Usage tracking and analytics
- Responsive table UI

### AI Integration
- OpenAI-powered prompt generation
- Topic-based prompt creation
- Category and tone selection
- Save generated prompts to library
- Copy and regenerate functionality

### UI/UX
- Modern SaaS design (Notion/Linear inspired)
- Responsive layout with sidebar navigation
- Clean minimal color palette
- Card-based components with shadows
- Loading states and error handling
- Smooth animations and transitions

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Backend API running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
  components/          # Reusable components
    Layout.jsx        # Main layout with sidebar
    ProtectedRoute.jsx # Route protection wrapper
  contexts/           # React contexts
    AuthContext.jsx   # Authentication context
  pages/              # Page components
    DashboardPage.jsx
    PromptLibraryPage.jsx
    CreatePromptPage.jsx
    AIGeneratorPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
  services/           # API services
    api.js           # Axios configuration and API calls
  App.jsx             # Main app component
  main.jsx           # App entry point
  index.css          # Global styles and Tailwind
```

## API Integration

The frontend integrates with the backend API for:

- Authentication (`/api/auth/*`)
- Prompt management (`/api/prompts/*`)
- AI generation (`/api/ai/*`)
- Analytics (`/api/analytics/*`)

## Authentication Flow

1. User logs in via `/login`
2. JWT token stored in localStorage
3. Token included in all API requests
4. Protected routes check authentication status
5. Automatic redirect to login on token expiry

## Key Features

### Dashboard
- Real-time prompt statistics
- Top used prompts leaderboard
- Recent activity metrics
- Quick action buttons for common tasks

### Prompt Library
- Advanced search with category and tag filters
- Sortable table with pagination
- Usage tracking and analytics
- Inline actions (view, edit, delete, use)

### Create Prompt
- Form validation with error handling
- Tag management system
- Category selection
- Auto-save functionality

### AI Generator
- OpenAI integration for prompt generation
- Topic-based generation with category and tone
- Copy and regenerate functionality
- Save generated prompts to library

## Responsive Design

- Mobile-first approach
- Collapsible sidebar for mobile
- Responsive tables and cards
- Touch-friendly interface

## Error Handling

- Global error boundary
- API error handling with user feedback
- Loading states for all async operations
- Graceful degradation for API failures

## Performance

- Code splitting with React.lazy
- Optimized API calls with axios interceptors
- Debounced search functionality
- Efficient state management with React Context

## Deployment

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Environment Variables
- `VITE_API_URL` - Backend API URL
- `VITE_NODE_ENV` - Environment (development/production)

## Contributing

1. Follow the existing code style
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Test responsive design

## License

MIT License
