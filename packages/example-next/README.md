# Portkey Provider Example - Next.js

This is a Next.js implementation of the Portkey Provider example, showcasing how to integrate Portkey wallet functionality in a modern React application.

## Features

- Portkey Provider integration
- Wallet connection and management
- Chain operations
- Contract interactions
- Transaction signing
- Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn or npm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js 13+ app directory
│   ├── globals.css     # Global styles with Tailwind CSS
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main page component
├── components/          # React components
│   └── HomePage.tsx    # Main HomePage component
├── hooks/              # Custom React hooks
│   └── hooks.ts        # useExampleState hook
└── decodeTx.ts         # Transaction decoding utilities
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies

- **Next.js 14** - React framework
- **Portkey SDKs** - Wallet integration
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety

## Notes

- This example uses the App Router (Next.js 13+)
- All components are client-side rendered due to wallet integration requirements
- The iframe example expects a server running on port 3001

