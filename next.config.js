/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig

// File: .env.local (create this file locally - don't commit to git)
OPENAI_API_KEY=your_openai_api_key_her
