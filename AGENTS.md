# AGENTS.md - AI Coding Agent Guide

## Project Overview
This is a **terminal-style React personal website** that simulates a retro VT terminal emulator. The core concept is an interactive bash-like console with hidden easter eggs and achievements - intentionally fun and quirky.

## Architecture & Key Patterns

### Container/Presentational Pattern (Enforced by ESLint)
- **Separation of Concerns**: Logic and presentation are strictly separated
- **Containers** (`src/containers/`): Manage state, side effects, and business logic
- **Views** (`src/components/*/View.tsx`): Pure presentational components that receive props
- **Enforcement**: ESLint rule prevents `useState` in `src/components/` files
- **Benefits**: Improved testability, maintainability, and code reusability

### Terminal Command System
- **Central Hub**: `src/Command.tsx` exports `commandsWithContext()` that creates a `Map<string, Command>`
- **Command Interface**: Each command has `description`, optional `secret` flag, and `run(...args)` function
- **Context Injection**: Commands access system state via `CommandContext` (users, environment, achievements, etc.)
- **Example**: Adding new commands requires updating the COMMANDS Map in `commandsWithContext()`

### Event-Driven Architecture
- **Custom Events**: `src/hooks/useEvent.ts` provides typed custom events (`onAchievement`, `onCommand`)
- **Achievement System**: `src/containers/AchievementProvider.tsx` manages unlockable easter eggs
- **Analytics Integration**: Plausible tracker automatically captures command usage and achievements

### Component Organization
```
src/
├── App.tsx                        # Main app with event listeners
├── Command.tsx                    # Command registry and implementations
├── Users.tsx                      # User profiles displayed by whois
├── containers/                    # Business logic layer
│   ├── AchievementProvider.tsx   # Achievement management with Context
│   ├── NotificationProvider.tsx  # Notification management with Context
│   ├── ShellPrompt.tsx           # Shell state and command execution
│   ├── CookieNotice.tsx          # Cookie acknowledgment logic
│   └── Hints.tsx                 # Command hints logic
└── components/                    # Presentation layer
    ├── ShellPrompt/
    │   ├── ShellPromptView.tsx   # Terminal UI (presentational)
    │   └── ShellPrompt.test.tsx
    ├── ConsoleOutput/             # Command result display
    ├── CookieNotice/
    │   ├── CookieNoticeView.tsx  # Cookie notice UI (presentational)
    │   └── CookieNotice.test.tsx
    ├── Hints/
    │   ├── HintsView.tsx         # Hints UI (presentational)
    │   └── Hints.test.tsx
    └── Notification/
        ├── NotificationView.tsx   # Notification UI (presentational)
        └── Notification.test.tsx
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
- **Container/View Pattern**: ESLint enforces separation - no `useState` in `src/components/` files

## Integration Points

### External Dependencies
- **New.css**: Classless CSS framework providing terminal aesthetic
- **Plausible Analytics**: Privacy-focused analytics with custom event tracking
- **Fira Code**: Monospace font with ligatures

### Data Flow Patterns
- **LocalStorage**: Command history, achievements, last login stored persistently
- **React Context**: Achievements and Notifications use provider patterns (see `src/containers/`)
- **Custom Hooks**: `useEvent` for DOM event abstraction, `useTracker` for analytics, `useLocalStorage` for persistent state

### Deployment
- **GitHub Pages**: Automated via `.github/workflows/deploy.yml`
- **Docker**: Container builds pushed to GitHub Container Registry
- **Static Assets**: Built to `build/` directory, served by nginx in production

## Key Files for New Features

- **New Commands**: Modify `commandsWithContext()` in `src/Command.tsx`
- **New Achievements**: Update `coreAchievements` in `src/containers/AchievementProvider.tsx`
- **New Users**: Add entries to `USERS` Map in `src/Users.tsx`
- **New UI Components**: 
  - Create container in `src/containers/YourFeature.tsx` for logic/state
  - Create view in `src/components/YourFeature/YourFeatureView.tsx` for presentation
  - Add co-located test file: `src/components/YourFeature/YourFeature.test.tsx`
- **Styling**: Add terminal-themed inline styles or minimal CSS files

### Adding New Features (Container/View Pattern)

When creating a new feature, follow this structure:

1. **Create Container** (`src/containers/YourFeature.tsx`):
   ```typescript
   import { useState } from 'react';
   import YourFeatureView from '../components/YourFeature/YourFeatureView';
   
   export default function YourFeature() {
       const [state, setState] = useState(initialState);
       
       const handleAction = () => {
           // Business logic here
       };
       
       return (
           <YourFeatureView
               data={state}
               onAction={handleAction}
           />
       );
   }
   ```

2. **Create View** (`src/components/YourFeature/YourFeatureView.tsx`):
   ```typescript
   interface YourFeatureViewProps {
       data: DataType;
       onAction: () => void;
   }
   
   export default function YourFeatureView({ data, onAction }: YourFeatureViewProps) {
       // Pure presentational component - no useState!
       return <div onClick={onAction}>{data}</div>;
   }
   ```

3. **Add Tests** (`src/components/YourFeature/YourFeature.test.tsx`):
   - Test container logic and view rendering together
   - Use providers as needed (AchievementProvider, NotificationProvider)

This codebase prioritizes accessibility, maintainability, and whimsical user experience over complex architectures.
