# Pulse AI

Build a polished web prototype called ProjectPulse AI — AI Project Operations Assistant.

This is a prototype for businesses that need AI to help project managers respond to unexpected project disruptions.

The app should feel like a professional B2B SaaS product, not a generic chatbot.

CORE USER FLOW:

The user sees a project operations dashboard.

Show a sample project called "Q4 Product Launch".

Display:

Overall project status

Project completion percentage

Budget and spending

Upcoming deadline

Active risks

Key tasks

Include a prominent button called "Simulate Disruption".

When clicked, simulate this scenario:
"Key supplier has reported a 5-day delivery delay."

After the disruption, show an AI-generated impact analysis containing:

Affected tasks

Expected timeline impact

Potential budget impact

New project risks

Recommended actions

Include a section called "AI Recommended Actions" with 3–5 actionable recommendations.

Include a section called "Management Briefing" containing a concise professional update that a project manager could send to senior management.

Make it clear that the AI is helping the manager make decisions rather than automatically making decisions for them.

DESIGN:

Modern professional B2B SaaS interface.

Clean dashboard layout.

Responsive design for desktop and mobile.

Use cards, status indicators, progress bars and tables where appropriate.

Avoid excessive animations.

Make the interface visually impressive but simple and easy to understand.

Use professional typography and spacing.

The main experience should be understandable within 30 seconds.

IMPORTANT:

This is a prototype, so use realistic simulated project data.

Do not build unnecessary features such as authentication, payment processing, Slack/Jira integrations, or real-time external logistics data.

Prioritize a working, polished demonstration of the disruption → impact analysis → recommendation workflow.

Include clear sample data so the prototype works immediately after opening.

Make the disruption simulation interactive rather than just displaying static text.

TECHNICAL:

Build this as a modern web application.

Keep the architecture simple and maintainable.

Structure the application so an AI/LLM backend could be connected later.

For the prototype, the AI analysis may use realistic simulated responses if a live AI API is not available.

Include comments/documentation explaining where a real LLM API would connect.

Do not expose API keys in frontend code.

Make sure the application runs without requiring the user to log in.

The final prototype should be suitable for sharing as a public demonstration to a technology company evaluating a Strategy Intern candidate.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://disruption-pilot-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bce1803f-88eb-4264-8996-3b47361586fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
