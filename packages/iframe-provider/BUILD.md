# Build Configuration

This package uses Vite as the build system.

## Vite Build

The Vite build system provides fast builds and excellent ESM support:

```bash
# Development build
yarn dev
yarn dev:watch

# Production build
yarn build
yarn build:watch
```

## Build Output

The build system outputs to the `dist/` directory:

- `index.js` - Main bundle (ESM format)
- `index.js.map` - Source map
- `index.d.ts` - TypeScript declarations
- `**/*.d.ts` - TypeScript declaration files for all modules
- `**/*.d.ts.map` - Source maps for TypeScript declarations

## Key Features

### Vite Build
- **Format**: ESM (ES Modules)
- **Performance**: Fast build times
- **Tree Shaking**: Excellent tree shaking support
- **Polyfills**: Handles Node.js polyfills (stream, buffer) automatically
- **No Minification**: Code is not minified or obfuscated for better debugging
- **TypeScript**: Full TypeScript declaration file generation

## Configuration Files

- `vite.config.ts` - Vite configuration

## Dependencies

### Vite Dependencies
- `vite`
- `vite-plugin-dts` (for TypeScript declaration files)
- `stream-browserify`, `buffer`
