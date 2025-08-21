# ThinkClear

Watch AI reason through any question with complete transparency.

## Features

- **Transparent Reasoning**: See every step of the AI's thought process
- **Assumption Questioning**: AI that challenges its own assumptions
- **Interactive Demo**: Try it with any question
- **Beautiful UI**: Clean, modern design focused on clarity

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **AI**: OpenAI GPT-4 Turbo
- **Styling**: CSS Modules
- **Deployment**: Vercel

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd thinkclear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy

## Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

- `OPENAI_API_KEY`: Your OpenAI API key

## How It Works

The AI is prompted to structure its response with clear reasoning steps:

1. **Understanding the Question**: How it interprets the query
2. **Approach**: The method it's using to think through the problem
3. **Key Assumptions**: What it's assuming that might be wrong
4. **Missing Information**: What would make its reasoning more reliable
5. **Alternative Perspectives**: Other ways to look at the problem

This creates transparency that builds trust and helps users learn better reasoning patterns.

## License

MIT
