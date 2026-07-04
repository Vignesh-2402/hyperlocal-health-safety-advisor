# Hyperlocal Health & Safety Advisor

A web app that gives users real-time, location-based health and safety alerts, paired with an AI chat assistant for answering questions about local conditions.

## Features

- **Zone Selector** — choose or detect your local area to get relevant alerts
- **Alerts Panel** — view active health and safety advisories for your selected zone
- **AI Chat Assistant** — ask natural-language questions and get contextual guidance
- Built with a TypeScript + React frontend and a lightweight backend server

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js / TypeScript (`server.ts`)
- **Styling:** [update if you're using Tailwind/CSS modules/etc.]
- **AI Integration:** [name of API used, e.g. Google Gemini / OpenAI — see `.env.example`]

## Project Structure

```
├── assets/                  # Static assets
├── src/
│   ├── components/
│   │   ├── AlertsPanel.tsx  # Displays health & safety alerts
│   │   ├── ChatPanel.tsx    # AI chat interface
│   │   └── ZoneSelector.tsx # Location/zone picker
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   └── index.css
├── server.ts                # Backend server
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
git clone https://github.com/Vignesh-2402/hyperlocal-health-safety-advisor.git
cd hyperlocal-health-safety-advisor
npm install
```

### Environment Setup

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

Then open `.env` and add your API key(s) as required.

### Running Locally

```bash
npm run dev
```

This will start the Vite dev server. Open the printed local URL in your browser.

### Building for Production

```bash
npm run build
```

## Usage

1. Select or allow detection of your local zone
2. View current health and safety alerts for that area
3. Use the chat panel to ask follow-up questions (e.g. "Is it safe to go outside today?")

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with a clear description of your changes.

## License

[Add your license here, e.g. MIT]
