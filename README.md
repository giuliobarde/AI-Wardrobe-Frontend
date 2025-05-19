# AI Wardrobe Frontend

<div align="center">
  <img src="public/logo.png" alt="AI Wardrobe Logo" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.9-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
</div>

## 🚀 Overview

AI Wardrobe is a modern web application that helps users manage and organize their clothing items using artificial intelligence. The frontend is built with Next.js 15, React 19, and TypeScript, providing a fast, responsive, and type-safe user experience.

## ✨ Features

- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Lightning-fast performance with Next.js 15 and Turbopack
- 🔒 Type-safe development with TypeScript
- 🎭 Smooth animations with Motion
- 📱 Mobile-first design approach
- 🎯 SEO optimized
- 🔄 Real-time updates and interactions

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **UI Library:** [React 19](https://reactjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Animations:** [Motion](https://motion.dev)
- **Icons:** [Lucide Icons](https://lucide.dev)
- **HTTP Client:** [Axios](https://axios-http.com)
- **Development:** [Turbopack](https://turbo.build/pack)

## 🏗️ Project Structure

```
frontend/
├── src/                      # Source files
│   ├── app/                  # Next.js app directory
│   │   ├── components/       # Shared components
│   │   ├── config/          # Configuration files
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── models/          # TypeScript interfaces and types
│   │   ├── services/        # API and external service integrations
│   │   ├── Settings/        # Settings page components
│   │   ├── Outfits/         # Outfits page components
│   │   ├── Profile/         # Profile page components
│   │   ├── Wardrobe/        # Wardrobe page components
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Home page component
│   └── lib/                 # Utility functions and shared code
│       └── utils.ts         # Helper functions
├── public/                  # Static assets
│   └── logo.png            # Project logo
├── components.json         # Component configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

Each directory serves a specific purpose:

- **app/**: Contains all the application code following Next.js 13+ app directory structure
  - **components/**: Reusable UI components
  - **config/**: Application configuration files
  - **context/**: React context providers for state management
  - **hooks/**: Custom React hooks for shared logic
  - **models/**: TypeScript interfaces and type definitions
  - **services/**: API clients and external service integrations
  - **Settings/**, **Outfits/**, **Profile/**, **Wardrobe/**: Feature-specific page components
- **lib/**: Shared utilities and helper functions
- **public/**: Static assets like images and fonts

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-wardrobe.git
   cd ai-wardrobe/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🧪 Running Tests

```bash
npm run test
# or
yarn test
# or
pnpm test
```

## 📝 Code Style

This project uses ESLint and Prettier for code formatting. Run the linter:

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org)
- [Vercel](https://vercel.com)
- [Tailwind CSS Team](https://tailwindcss.com)
- All contributors and supporters of the project
