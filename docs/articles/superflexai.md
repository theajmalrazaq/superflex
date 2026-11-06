# Octopus AI: Academic Assistant Guide

Octopus AI is an optional assistant inside SuperFlex. It connects directly to Google's Gemini API using a key you provide and can include selected academic context in a conversation.

## Setup

1. Open **SuperFlex Settings**.
2. Select **Octopus AI**.
3. Enable the assistant.
4. Create a free Gemini API key in Google AI Studio.
5. Paste the key into SuperFlex and select **Save Key**.

SuperFlex validates the key, loads compatible Gemini models, and keeps the selected model in local extension storage. The key is sent only to Google's Gemini API; it is not sent to a SuperFlex server.

## How academic context works

SuperFlex builds context from portal pages it can read in your authenticated browser session:

- Home and profile information
- Marks and course assessments
- Attendance summaries and individual records
- Transcript and GPA history
- Study plan and remaining coursework

Context synchronization is local. Only the context needed for an enabled AI request is sent with your prompt to Gemini. You can disable Octopus AI from settings at any time.

## Model selection and fallback

The available model list comes from your Gemini API key. SuperFlex prioritizes compatible Flash models for responsive chat, but the exact list depends on Google and your account.

When the selected model is overloaded, rate-limited, retired, or temporarily unavailable, SuperFlex can retry with another compatible model and save the working choice. This prevents a single unavailable model from breaking the assistant.

## Writing useful prompts

A strong academic prompt includes:

1. **Context** — the course, semester, or record you mean.
2. **Metric** — the exact calculation or comparison you need.
3. **Goal** — the decision you are trying to make.

Instead of:

> How are my grades?

Try:

> Based on my current Numerical Computing marks, estimate my weighted total if I average 80% in the remaining assignments. Show the assumptions.

## Prompt examples

### Attendance

- "Which courses are closest to the 80% attendance threshold?"
- "If I miss the next Compiler Construction class, what will the estimated percentage be?"
- "Summarize my absences by course and date."

### Marks and grades

- "Compare my obtained weighted marks with the available weight in each course."
- "Show a best-case and conservative final-grade forecast for Data Structures."
- "Explain which assessment would have the biggest effect on my total."

### Transcript and planning

- "What semester GPA would I need to reach a 3.5 CGPA? State any assumptions."
- "Summarize repeated courses and their possible impact on my CGPA."
- "Which core courses remain in my study plan?"

### Output format

Octopus AI supports Markdown. Ask for a specific format when it helps:

- "Return this as a compact table."
- "List the assumptions before the calculation."
- "Give me a three-step action plan."

## Troubleshooting

### The assistant says data is missing

Visit the relevant portal page so SuperFlex can parse and cache the latest record, then retry. Transcript context may require opening the Transcript page during the current session.

### The API key does not connect

- Confirm the key was created in Google AI Studio.
- Check that the key has access to the Gemini API.
- Generate a replacement key if it was exposed publicly.
- Retry after a short delay if Google reports high demand.

### A model is unavailable

Refresh the available models in settings or select another compatible model. SuperFlex may also switch automatically when a request fails for an availability-related reason.

## Privacy and reliability

- Octopus AI is opt-in.
- Your Gemini key is stored in `chrome.storage.local` and is not placed in the portal page DOM.
- Prompts and permitted academic context are processed by Google's Gemini API under your Google account and provider settings.
- Chat history remains local to the browser unless you copy or send it elsewhere.
- AI output is an estimate, not an official academic record. Verify important calculations against the portal and university policy.
