<div align="center">
  <img src="public/assets/logo.svg" alt="SuperFlex Logo" width="300" />
  <p>A modern interface enhancement extension for university learning management systems</p>
  
<p>
  <a href="https://github.com/theajmalrazaq/superflex/releases">
    <img src="https://img.shields.io/github/downloads/theajmalrazaq/superflex/total?style=for-the-badge&color=a098ff" alt="GitHub all downloads">
  </a>
  
  <a href="https://github.com/theajmalrazaq/superflex">
    <img src="https://img.shields.io/github/stars/theajmalrazaq/superflex?style=for-the-badge&color=a098ff" alt="GitHub stars">
  </a>

  <a href="https://github.com/theajmalrazaq/superflex/issues">
    <img src="https://img.shields.io/github/issues-raw/theajmalrazaq/superflex?style=for-the-badge&color=a098ff" alt="GitHub issues">
  </a>

  <a href="https://github.com/theajmalrazaq/superflex/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-a098ff?style=for-the-badge" alt="License">
  </a>
</p>

  <p>
    <a href="https://theajmalrazaq.github.io/superflex">Website</a> •
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#development">Development</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

## Overview

SuperFlex is the ultimate glow-up for that crusty university Flex portal at NUCES that was giving major 2005 vibes. It's literally a browser extension that said "challenge accepted" and transformed the ancient interface into this sleek, dark-mode masterpiece. It's not just a pretty face though - we've added so many features that your productivity is about to be _chef's kiss_ 🔥

This bad boy works by sneaking React components into the boring old LMS pages, basically performing plastic surgery on the UI. No cap, it's the ultimate uni life hack that the administration wasn't ready for. Flex portal? More like FLEX on your classmates with this aesthetic upgrade! 😎

## Features

### 🤖 AI-Powered Academic Assistant

- **Multi-Model Support**: Chat with multiple AI models including:
  - Google Gemini 2.0 Flash & Gemini 3 Pro/Flash
  - OpenAI GPT-4o Mini
  - Anthropic Claude Haiku
  - xAI Grok 2
  - And more cutting-edge models
- **Context-Aware Responses**: AI understands your academic data (CGPA, attendance, marks, study plan)
- **Intelligent Predictions**: Get grade forecasts, attendance warnings, and study recommendations
- **Auto Data Sync**: Automatically fetches and syncs your academic records for AI context
- **Persistent Chat History**: Your conversations are saved across sessions

### 🎨 Modern UI/UX

- **Glassmorphic Dark Mode**: Stunning dark theme with frosted glass effects
- **Google Sans Flex Typography**: Professional and highly readable custom font
- **Flat Design**: Modern minimalist aesthetic with no shadow bloat
- **Smooth Animations**: Buttery transitions and micro-interactions
- **Responsive Layout**: Optimized for all screen sizes
- **Custom Loading States**: Beautiful animated loading overlays with splash branding
- **AI Data Visualization**: Interactive status cards within the AI assistant

### 📊 Enhanced Dashboards

- **Attendance Visualization**:
  - Color-coded progress bars (green/yellow/red based on percentage)
  - Real-time attendance tracking with warnings
  - Detailed course-wise breakdown
  - Bookmark important courses
- **Advanced Grade Calculator**:
  - What-if scenario planning
  - Target CGPA calculator
  - Best-of score calculations
  - Grade scheme visualization
  - Real-time GPA updates
- **CGPA Tracking**: Monitor semester and cumulative GPA trends
- **Financial Dashboard**: Clear fee breakdown and transaction history

### 🛠️ Improved Functionality

- **Smart Tables**:
  - Sortable columns
  - Filterable data
  - Responsive design
  - Export capabilities
- **Interactive Accordions**: Collapsible sections for better content organization
- **Custom Navigation**: Streamlined sidebar with quick access to all features
- **Bookmark System**: Mark and quick-access important courses
- **Real-time Calculations**: Instant grade and attendance calculations
- **Data Persistence**: LocalStorage integration for settings and preferences

### 📈 Analytics Integration

- **Umami Analytics**: Privacy-focused usage tracking
- **Performance Monitoring**: Track extension performance and user engagement
- **No Personal Data Collection**: Analytics only track usage patterns, not personal information

## Supported Pages

SuperFlex enhances the following university LMS pages:

- **Home Page**: Dashboard with key student information
- **Transcript Page**: Academic records with GPA calculator
- **Marks Page**: Course marks with performance visualization
- **Attendance Page**: Attendance tracking with statistics
- **Study Plan Page**: Curriculum planning with modern interface
- **Course Feedback Page**: Improved feedback submission forms
- **Grade Change Page**: Streamlined grade appeal process
- **Fee Details Page**: Clearer financial information display
- **Retake Exam Page**: Simplified exam registration process

## Installation

### Desktop (Chrome/Chromium Browsers)

1. Download the latest release from the [GitHub Releases page](https://github.com/theajmalrazaq/superflex/releases)
2. Unzip the downloaded file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer Mode" in the top right
5. Click "Load Unpacked" and select the unzipped folder
6. SuperFlex will now be active when you visit your university LMS

### Mobile (Android)

SuperFlex works on mobile devices using **Quetta Browser** - a Chromium-based browser with extension support:

1. Download **Quetta Browser** from the Play Store or visit [quetta.net](https://www.quetta.net/features/extensions)
2. Download the latest SuperFlex release from [GitHub Releases](https://github.com/theajmalrazaq/superflex/releases)
3. Extract the downloaded file to your device
4. Open Quetta Browser and navigate to the extensions page
5. Enable "Developer Mode"
6. Load the unpacked SuperFlex extension folder
7. Enjoy SuperFlex on your mobile device! 📱

## Development

SuperFlex is built with modern web technologies:

- **React**: Component-based UI library
- **Vite**: Fast build tooling
- **Tailwind CSS**: Utility-first CSS framework
- **CRXJS**: Chrome extension development tools

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Chrome browser

### Setup Development Environment

1. Clone the repository:

```bash
git clone https://github.com/theajmalrazaq/superflex.git
cd superflex
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer Mode"
   - Click "Load Unpacked"
   - Select the `dist` folder from your project directory

5. The extension will automatically reload when you make changes

### Project Structure

```
superflex/
├── docs/                      # Documentation website
│   ├── articles/              # Markdown articles
│   │   ├── bts.md            # Behind the Scenes technical guide
│   │   └── superflexai.md    # AI prompting guide
│   ├── res/                   # Documentation assets
│   ├── index.html             # Landing page
│   └── docs.html              # Documentation viewer
├── public/                    # Static assets
│   ├── assets/                # Images, logos, icons
│   │   ├── favicon.svg
│   │   ├── favicon.png
│   │   ├── logo.svg
│   │   └── overlay.png
│   ├── scripts/               # Injected scripts
│   │   ├── bridge.js         # Main/Isolated world communication
│   │   ├── puter.js          # AI library
│   │   ├── umami.js          # Analytics
│   │   ├── polyfill.js       # Web streams polyfill
│   │   └── rustls.js         # Security polyfill
│   └── reviews.json           # User reviews data
├── src/
│   ├── components/            # React components
│   │   ├── layouts/          # Layout components
│   │   │   └── PageLayout.jsx
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── LoadingOverlay.jsx
│   │   │   ├── NotificationBanner.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── ...
│   │   ├── LoginPageStyles.jsx # Login page styling
│   │   ├── NavBar.jsx         # Navigation component
│   │   ├── PathRouter.jsx     # Client-side router
│   │   └── SuperFlexAI.jsx    # AI chat interface
│   ├── pages/                 # Page-specific components
│   │   ├── HomePage.jsx
│   │   ├── MarksPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── TranscriptPage.jsx
│   │   ├── StudyPlanPage.jsx
│   │   ├── FeeDetailsPage.jsx
│   │   ├── GradeChangePage.jsx
│   │   ├── RetakeExamPage.jsx
│   │   ├── ChangePasswordPage.jsx
│   │   └── ...
│   ├── styles/                # CSS and Tailwind
│   │   ├── tailwind.css      # Main styles
│   │   └── loading.css       # Loading state styles
│   ├── constants/             # App constants
│   ├── utils/                 # Utility functions
│   └── content.jsx            # Content script entry point
├── manifest.json              # Chrome extension manifest
├── vite.config.js             # Vite build configuration
├── package.json               # Dependencies
└── pnpm-lock.yaml             # Lock file
```

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The production build will be available in the `dist` folder, ready to be published or loaded as an unpacked extension.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code follows the project's coding style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- The university community for providing feedback and feature suggestions
- All contributors who have helped improve SuperFlex
- [Lucide Icons](https://lucide.dev/) for beautiful UI icons

## Contact

Ajmal Razaq Bhatti - [@theajmalrazaq](https://github.com/theajmalrazaq)

Project Link: [https://github.com/theajmalrazaq/superflex](https://github.com/theajmalrazaq/superflex)

## Disclaimer

SuperFlex is an independent project that redesigns the Flex portal of NUCES university. This extension is not affiliated with, endorsed by, or sponsored by NUCES university.

This is my personal project intended to enhance my learning experience. I did not hack anything or intend to do so. SuperFlex merely applies cosmetic changes to the user interface without compromising any security measures or accessing unauthorized data. This project should not warrant any academic warnings or disciplinary actions as it respects the system's integrity and security.

Users are using this extension at their own consent and responsibility. The creator of SuperFlex is not responsible for any issues that may arise from using this extension, including but not limited to academic discrepancies, data inaccuracies, or system incompatibilities.

By installing SuperFlex, you acknowledge that you are using a third-party modification to the university's official system and do so at your own risk.
