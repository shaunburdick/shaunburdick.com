# AGENTS.md - AI Coding Agent Guide

## Project Overview
This is a **terminal-style React personal website** that simulates a retro VT terminal emulator. The core concept is an interactive bash-like console with hidden easter eggs and achievements - intentionally fun and quirky.

## Architecture & Key Patterns

### Terminal Command System
- **Central Hub**: `src/Command.tsx` exports `commandsWithContext()` that creates a `Map<string, Command>`
- **Command Interface**: Each command has `description`, optional `secret` flag, and `run(...args)` function
- **Context Injection**: Commands access system state via `CommandContext` (users, environment, achievements, etc.)
- **Example**: Adding new commands requires updating the COMMANDS Map in `commandsWithContext()`

### Event-Driven Architecture
- **Custom Events**: `src/hooks/useEvent.ts` provides typed custom events (`onAchievement`, `onCommand`)
- **Achievement System**: `src/components/Achievements/Achievements.tsx` manages unlockable easter eggs
- **Analytics Integration**: Plausible tracker automatically captures command usage and achievements

### Component Organization
```
src/
├── App.tsx                    # Main app with event listeners
├── Command.tsx               # Command registry and implementations
├── Users.tsx                 # User profiles displayed by whois
└── components/
    ├── ShellPrompt/          # Core terminal interface
    ├── ConsoleOutput/        # Command result display
    ├── Achievements/         # Easter egg system
    └── Notification/         # Toast notifications
```

## Development Workflows

### Essential Commands
- **Development**: `npm start` (webpack dev server)
- **Testing**: `npm test` (lint + unit tests), `npm run test:watch`
- **Production Build**: `npm run build`
- **Linting**: `npm run lint` or `npm run lint:fix`

### Testing Strategy
- **Jest + React Testing Library**: All components have `.test.tsx` files
- **High Coverage Requirements**: 90% threshold enforced (see `jest.config.js`)
- **Mock Patterns**: Window APIs mocked (see `Command.test.tsx` for `window.open`)
- **Provider Testing**: Achievement/Notification contexts wrapped in test utilities

### Build System
- **Webpack Configuration**: Split configs (`webpack.common.js`, `webpack.development.js`, `webpack.production.js`)
- **Environment Variables**: Build info injected via `webpack.DefinePlugin` (version, commit hash, build date)
- **Docker**: Multi-stage build with nginx serving (see `Dockerfile`)

## Project-Specific Conventions

### Styling Approach
- **No CSS Classes**: Uses New.css framework + direct inline styles
- **Terminal Theme**: Monospace fonts (Fira Code), green-on-black color scheme
- **Minimal CSS**: Only essential styling in dedicated CSS files (`ShellPrompt.css`, `Notification.css`)

### Accessibility Focus
- **WCAG 2.2 AA**: Screen reader support throughout
- **ARIA Patterns**: `aria-live` regions for console output, proper semantic HTML
- **Keyboard Navigation**: Arrow keys for command history, tab handling in input

### Easter Eggs & Achievements
- **Secret Commands**: Hidden commands (marked with `secret: true`)
- **Achievement System**: Unlockable via specific actions (first command, rickroll, etc.)
- **Persistent State**: LocalStorage for command history, achievements, preferences

### Code Quality
- **TSDoc Required**: All functions/components documented with `@param`/`@returns`
- **Import Organization**: React, third-party, local imports (alphabetical within groups)
- **ESLint Config**: Uses `eslint-config-shaunburdick` with React + TypeScript rules

## Integration Points

### External Dependencies
- **New.css**: Classless CSS framework providing terminal aesthetic
- **Plausible Analytics**: Privacy-focused analytics with custom event tracking
- **Fira Code**: Monospace font with ligatures

### Data Flow Patterns
- **LocalStorage**: Command history, achievements, last login stored persistently
- **React Context**: Achievements and Notifications use provider patterns
- **Custom Hooks**: `useEvent` for DOM event abstraction, `useTracker` for analytics

### Deployment
- **GitHub Pages**: Automated via `.github/workflows/deploy.yml`
- **Docker**: Container builds pushed to GitHub Container Registry
- **Static Assets**: Built to `build/` directory, served by nginx in production

## Key Files for New Features

- **New Commands**: Modify `commandsWithContext()` in `src/Command.tsx`
- **New Achievements**: Update `coreAchievements` in `src/components/Achievements/Achievements.tsx`
- **New Users**: Add entries to `USERS` Map in `src/Users.tsx`
- **UI Components**: Follow existing pattern in `src/components/` with co-located tests
- **Styling**: Add terminal-themed inline styles or minimal CSS files

This codebase prioritizes accessibility, maintainability, and whimsical user experience over complex architectures.
