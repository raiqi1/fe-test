# Greenlock AI Chatbot - Frontend

A modern Next.js frontend for Greenlock AI Chatbot featuring an advanced retrieval system with hybrid search and re-ranking capabilities.

## ✨ Features

- **Modern UI/UX** - Clean, responsive design with automatic dark mode support
- **Real-time Chat Interface** - Instant responses with streaming support
- **Smart Search** - Hybrid search combining dense and sparse retrieval with re-ranking
- **Source Attribution** - View sources and page numbers for every answer
- **Knowledge Base Management** - Upload documents and refresh website content
- **Performance Metrics** - Real-time response time tracking
- **Suggested Prompts** - Quick-start questions for common topics
- **Dark Mode** - Automatic theme detection and switching

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running at `http://localhost:8000`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If not set, the app will default to `http://localhost:8000`.

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
greenlock-chatbot-frontend/
├── app/
│   ├── page.tsx          # Main chat interface
│   ├── layout.tsx        # Root layout with metadata
│   ├── globals.css       # Global styles and Tailwind
│   └── favicon.ico       # App icon
├── public/               # Static assets
├── components/           # Reusable components (if any)
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Project dependencies
```

## 🎨 User Interface

### Chat Interface
- **Message Display** - Distinct styling for user and assistant messages
- **Source Attribution** - Shows document names, page numbers, and URLs
- **Response Metrics** - Displays response time for each answer
- **Suggested Prompts** - 8 pre-configured questions for quick start
- **Loading States** - Animated indicators during processing

### Knowledge Base Panel
- **Status Dashboard** - Real-time knowledge base status monitoring
- **Document Upload** - Upload PDF documents to expand knowledge
- **Website Refresh** - Re-scrape website content for latest information
- **Content Statistics** - View total chunks and data sources

## 🔧 API Integration

The frontend connects to these backend endpoints:

```typescript
GET  /                          // System information
GET  /status                    // System status check
POST /ask                       // Send question (with search config)
POST /upload-greenlock-doc      // Upload PDF document
POST /refresh-website           // Refresh website content
POST /rebuild-knowledge-base    // Rebuild entire knowledge base
```

### Ask Endpoint Configuration

The frontend sends questions with these optimized parameters:

```typescript
{
  question: string,
  use_hybrid: true,              // Enable hybrid search
  use_query_rewriting: true,     // Enable query optimization
  use_reranking: true,           // Enable result re-ranking
  rerank_top_k: 5,               // Top K results to re-rank
  dense_weight: 0.5,             // Weight for semantic search
  sparse_weight: 0.5             // Weight for keyword search
}
```

## 💬 Usage Guide

### Basic Chat
1. Type your question in the input box
2. Press Enter or click the Send button
3. Wait for the response with source citations
4. Review sources and response time

### Upload Documents
1. Click "Upload Document" in the sidebar
2. Select a PDF file from your computer
3. Wait for the upload and knowledge base rebuild
4. Document content is now available for queries

### Refresh Website Content
1. Click "Refresh Website" in the sidebar
2. Wait for the scraping process to complete
3. Latest website content is now available for queries

### Suggested Prompts
Click any suggested prompt button to quickly ask:
- What is Greenlock?
- Investment fees information
- Portfolio analysis details
- Hidden fees in private equity
- Cost reduction strategies
- Fee transparency concepts
- Hedge fund fee structures
- Greenlock services overview

## 🎯 Key Features Explained

### Hybrid Search
Combines semantic (dense) and keyword (sparse) search for better retrieval:
- Dense vectors capture meaning and context
- Sparse vectors match exact keywords
- Balanced 50/50 weighting by default

### Query Rewriting
Automatically optimizes user queries for better search results:
- Expands abbreviations
- Adds context
- Improves search precision

### Re-ranking
Re-scores top results for maximum relevance:
- Uses cross-encoder model
- Considers query-document relevance
- Returns top 5 most relevant results

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Verify API endpoint in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Build Errors
```bash
# Clear cache and reinstall dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### TypeScript Errors
```bash
# Update type definitions
npm install --save-dev @types/react @types/node typescript
```

### CORS Issues
Ensure your backend has CORS enabled for `http://localhost:3000` (development) or your production domain.

## 🎨 Customization

### Modify Colors
Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0fdf4',
        500: '#10b981',  // Primary color
        600: '#059669',
        700: '#047857',
      }
    }
  }
}
```

### Change API URL
Update the environment variable or modify the default in `app/page.tsx`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://your-api-url";
```

### Adjust Search Parameters
Modify the default search configuration in the `sendMessage` function:

```typescript
formData.append("dense_weight", "0.7");  // Favor semantic search
formData.append("sparse_weight", "0.3"); // Reduce keyword search
formData.append("rerank_top_k", "3");    // Re-rank fewer results
```

## 📊 Performance Optimization

1. **Production Build** - Always use production builds for deployment
2. **Image Optimization** - Use Next.js Image component for images
3. **Code Splitting** - Automatically handled by Next.js
4. **Lazy Loading** - Components load on-demand
5. **Response Caching** - Status checks cached for 30 seconds

## 🔐 Security Considerations

- **Authentication** - Currently no authentication (development mode)
- **Input Sanitization** - Implement user input validation
- **CORS Configuration** - Configure proper CORS policies
- **Environment Variables** - Use `.env.local` for sensitive data
- **API Rate Limiting** - Consider implementing rate limits

## 📚 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hooks** - Modern state management

## 🚀 Deployment

### Quick Setup Script

Use the provided setup script for easy installation:

```bash
# Make the script executable
chmod +x setup_fe.sh

# Run the setup script
./setup_fe.sh
```

The `setup_fe.sh` script will:
- Check Node.js installation
- Install all dependencies
- Set up environment variables
- Start the development server

### Manual Deployment

For production deployment:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com
```
Or Rename .env.dist to .env

