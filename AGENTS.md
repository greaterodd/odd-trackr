# AGENTS.md

## Commands
- `pnpm dev` - Start dev server
- `pnpm build` - Build for production
- `pnpm typecheck` - Type checking
- `pnpm biome check .` - Lint/format check
- `pnpm biome check --apply .` - Fix lint/format issues

## Code Style
- **Formatter**: Biome (tabs, double quotes)
- **Imports**: Organized automatically by Biome
- **Types**: Strict TypeScript with React Router typegen
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Structure**: Use shadcn/ui patterns with `~/` aliases
- **Error handling**: Standard try/catch with proper TypeScript types
- **CSS**: Tailwind CSS with class-variance-authority for variants