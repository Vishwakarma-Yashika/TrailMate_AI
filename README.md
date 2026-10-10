# TrailMate AI

Adventure-themed outdoor exploration frontend built with Next.js, JavaScript, Tailwind CSS, and Lucide icons.

## Run locally

Requirements: Node.js 20.9+ recommended.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Current features

- Responsive dashboard and mobile navigation
- Nature quests with XP rewards
- Interactive quest completion and progress
- Achievement badge states
- Illustrative sample trail map
- Nature guide placeholder
- In-memory nature journal

## Frontend-only limitations

The AI response is placeholder copy; Ollama is not connected. Quest progress and journal entries reset on refresh. The map is illustrative and does not show a real route or current location.

## Next phase

Connect a compatible open-weight vision-language model through Ollama. For a local-first setup, keep the app and Ollama on the same computer and use a Next.js route to call the local model safely.
