# Instagram Carousel Generator

A web app to automatically generate Instagram carousels using artificial intelligence. Write a topic, customize the tone and colors, and get slides ready to publish.

> **[Leer en espanol](README.md)**

![App screenshot](assets/screenshot.png)

https://github.com/EriMCrea/carousel-generator/assets/demo.mp4

## Features

- Generates Instagram carousel content with AI (Claude by Anthropic)
- 7 writing tones: Direct, Educational, Inspirational, Storytelling, Controversial, Humorous, Tutorial
- 4 slide formats: 1:1 (Feed), 4:5 (Portrait), 9:16 (Stories/Reels), 16:9 (Landscape)
- Customize accent and background colors with 6 presets or custom colors
- Generate images for each slide with Google Gemini (optional)
- Export as PNGs (ZIP) or full PDF
- Window system: generate multiple carousels without losing previous ones
- Editable structure: control what goes on each slide before generating

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Text AI:** Claude (Anthropic)
- **Image AI:** Google Gemini
- **Export:** html2canvas + jsPDF + JSZip

## Installation

```bash
git clone https://github.com/EriMCrea/carousel-generator.git
cd carousel-generator
npm install
```

## Set Up API Keys

Create a local environment variables file in the project root. You can copy the included template (env.example) and rename it. Then add your keys:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Where to get the keys:
- Anthropic: https://console.anthropic.com/
- Google AI Studio: https://aistudio.google.com/apikey

> The Gemini key is optional. Without it, the app works perfectly for generating text, you just won't be able to generate images with AI.

## Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Use

1. Write the carousel topic
2. Select the writing tone
3. Choose the format (1:1, 4:5, 9:16, 16:9)
4. Adjust the number of slides (1-20, unlockable up to 100)
5. Optional: edit the structure of each slide
6. Click "Generar carrusel" (Generate carousel)
7. Each carousel appears in its own window — you can generate multiple without losing previous ones
8. Export as PNGs (ZIP) or PDF

## Project Structure

```
carousel-generator/
  app/
    page.tsx                    <- Main page and window system
    layout.tsx                  <- Global layout
    globals.css                 <- Base styles (Tailwind)
    api/
      generate/route.ts         <- API: generates content with Claude
      generate-image/route.ts   <- API: generates images with Gemini
  components/
    SlideCard.tsx               <- Visual design of each slide
    DraggableWindow.tsx         <- Draggable/resizable window
    StructureEditor.tsx         <- Carousel structure editor
    ExportPanel.tsx             <- Export buttons (PNG/PDF)
  lib/
    types.ts                    <- TypeScript types
    prompts.ts                  <- System/user prompts for Claude
    defaultStructure.ts         <- Default slide structure
  env.example                  <- Environment variables template
  README.md                    <- Spanish version
  README.en.md                 <- This file (English)
```

## Security

- API keys are read from server-side environment variables (Next.js API routes)
- They are never exposed to the user's browser
- The local environment file is in .gitignore and is not uploaded to GitHub
- There are no credentials, tokens, or personal information in the source code

## Customizing the Project

The app includes a "Suggestions for AI customization" section inside the info window, with step-by-step instructions to:

- Change the AI model (use OpenAI, Gemini, etc. instead of Claude)
- Change the image generator
- Add new writing tones
- Modify the visual slide design
- Change the branding
- Create new color presets

## Translating to Another Language

The entire interface is in Spanish. To translate it to English or another language:

### Files to Translate

1. **app/page.tsx** — UI text: labels, buttons, placeholders, onboarding cards, AI suggestion cards. This is the biggest file with the most strings.

2. **lib/prompts.ts** — The system prompt and user prompt sent to Claude. This controls what language the AI writes in. Change the instruction from "Escribe en espanol de Mexico" to your target language.

3. **lib/defaultStructure.ts** — Default instructions for each slide type (cover, content, CTA). These are the placeholder instructions users see before generating.

4. **components/SlideCard.tsx** — The brand text "ErickCrea" and "@erickcrea" handle on the CTA slide. Replace with your brand.

5. **components/ExportPanel.tsx** — Export button labels ("Exportar PNGs", "Exportar PDF", "Exportando...").

6. **components/StructureEditor.tsx** — Structure editor labels.

7. **app/api/generate/route.ts** and **app/api/generate-image/route.ts** — Server error messages.

### Quick Method

Give these instructions to your AI assistant (Claude, ChatGPT, etc.):

> "Translate all UI strings from Spanish to [language] in these files: page.tsx, prompts.ts, defaultStructure.ts, SlideCard.tsx, ExportPanel.tsx, StructureEditor.tsx, and the error messages in the API routes. Keep the code structure identical, only change the visible text strings."

### Important Notes

- The slide design uses **inline styles** (not Tailwind classes) for html2canvas export compatibility. Don't convert them to Tailwind.
- The `prompts.ts` file controls the AI's writing language. If you only change the UI but not the prompts, the AI will still generate content in Spanish.
- Color presets in `page.tsx` have Spanish labels (Violeta, Teal, Ambar, etc.) — translate those too.

## License

MIT

---

Built by [ErickCrea](https://github.com/EriMCrea)
