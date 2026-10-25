# Dhruv Gupta — Personal Portfolio

A responsive personal portfolio showcasing Dhruv's background, skills,
and five project entries.

## Features

- Home, About, Skills, Projects, Contact, and AI Chatbot sections
- Search projects by name or technology
- Category-based project filtering
- Light/dark mode toggle
- Responsive layout and mobile navigation
- AI chatbot powered by Groq
- Portfolio-specific context for chatbot responses
- Loading feedback and API error handling
- Server-side API key handling through a Vercel Function

## Projects

1. SafeRoute
2. Quiz project
3. Python Programs Collection
4. BUG-FIX
5. Reading List

Verify that project names and descriptions match the actual repositories
before submitting the assignment.

## Technologies

- HTML5
- CSS3
- JavaScript
- Vercel Serverless Functions
- Groq API

## GitHub Links

- GitHub profile: https://github.com/deshdecode52-beep
- MESSY: https://github.com/deshdecode52-beep/MESSY
- Quiz: https://github.com/deshdecode52-beep/QUIZ_25BCON1090
- BUG-FIX: https://github.com/deshdecode52-beep/BUG-FIX
- Reading List: https://github.com/deshdecode52-beep/READING-LIST
- Python Programs: https://github.com/deshdecode52-beep/Python-program-collection

## Run Locally

Install Node.js, then install the Vercel CLI:

    npm install

Start the local development server:

    npm run dev

The Vercel development server runs the website and the `/api/chat`
serverless function together.

## Configure the Chatbot

1. Create an API key in the Groq Console.
2. Add `GROQ_API_KEY` to the project's environment variables.
3. Optionally set `GROQ_MODEL` to a model available to your account.
4. Restart the local server or redeploy after changing environment variables.

Never put API keys in frontend JavaScript or commit them to GitHub.

## Deploy to Vercel

1. Push the project to a dedicated GitHub repository.
2. Import the repository into Vercel.
3. Add `GROQ_API_KEY` in Vercel Project Settings > Environment Variables.
4. Redeploy the project.
5. Test the search, filter, theme toggle, project links, and chatbot.

## Live Website

Add your deployed Vercel URL here after deployment.

