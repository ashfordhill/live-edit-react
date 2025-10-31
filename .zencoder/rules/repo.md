---
description: Repository Information Overview
alwaysApply: true
---

# Live Edit React Information

## Summary
Live Edit React is a proof-of-concept demonstrating real-time, bi-directional code editing through UI interactions. When dragging sliders in the browser, source code updates automatically and hot-reloads instantly. Inspired by Bret Victor's principles of immediate feedback in programming.

## Structure
- **src/**: React TypeScript components and hooks
  - Main entry: main.tsx
  - Components: App.tsx, Box.tsx, Circle.tsx, TextBox.tsx
  - Controls: LiveEditControls.tsx
  - Custom hook: useLiveEdit.ts
- **Root Config**: Vite, Babel, and TypeScript configurations
- **docs/**: Demo GIFs and documentation
- **index.html**: Web application entry point

## Language & Runtime
**Language**: TypeScript 5.6.3
**Framework**: React 18.3.1 with React-DOM 18.3.1
**Build System**: Vite 5.4.8
**Package Manager**: npm
**Target**: ES2020, Node.js modules

## Key Dependencies
**Production**:
- eact: ^18.3.1
- eact-dom: ^18.3.1

**Development**:
- ite: ^5.4.8 - Build tool and dev server
- 	ypescript: ^5.6.3 - TypeScript compiler
- @vitejs/plugin-react: ^4.2.1 - React plugin for Vite
- @babel/core: ^7.26.0 - Babel for custom compilation plugin
- @babel/parser: ^7.26.0 - AST parser with TypeScript/JSX support
- @babel/traverse: ^7.28.5 - AST traversal and manipulation
- @babel/generator: ^7.28.5 - Code generation from AST
- @babel/types: ^7.28.5 - AST node creators
- ecast: ^0.23.9 - Code transformation utility

## Build & Installation
\\\ash
npm install
npm run dev       # Start dev server with HMR
npm run build     # Build for production
npm run preview   # Preview production build
\\\

## Architecture Components

### 1. Babel Plugin (babel.config.cjs)
Custom plugin annotates JSX elements with metadata during compilation (dev only):
- Adds data-le-id attribute: Format "tagName:line:column"
- Adds data-le-file attribute: Source file path
- Only active when NODE_ENV !== 'production'

### 2. React Hook (src/useLiveEdit.ts)
Connects UI controls to source code:
- Extracts data-le-id and data-le-file from DOM elements
- Sends POST requests to /_liveedit/patch on value changes
- Payload: { file, id, prop, newValue }

### 3. Vite Plugin (liveedit.vite.ts)
HTTP middleware for live code patching:
- Exposes /_liveedit/patch endpoint
- Parses source files with Babel (TypeScript + JSX support)
- Locates target elements by position matching (line:column)
- Updates/adds JSX prop values using Babel AST builders
- Writes changes to disk, triggers HMR hot-reload

## Development Setup
**TypeScript Config**: 
- Target: ES2020
- JSX: react-jsx
- Strict mode enabled
- Module: ESNext with bundler resolution

**Vite Config**:
- React plugin with Babel integration
- Live Edit plugin loaded
- Hot Module Replacement (HMR) automatic

**Entry Point**: src/main.tsx renders React app into #root element in index.html

## Key Features
- Bi-directional code/UI synchronization
- Live-editing with zero-refresh hot reload
- Custom Babel and Vite plugins for automation
- TypeScript support with strict type checking
- Demo components: Box, Circle, TextBox with interactive controls
