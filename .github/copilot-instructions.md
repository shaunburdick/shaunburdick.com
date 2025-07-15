# Copilot Instructions for shaunburdick.com

## Project Overview
- Personal website for Shaun Burdick
- Retro terminal-style interface (VT terminal emulator)
- Built with React + TypeScript
- Contains intentional humor and easter eggs

## Technical Requirements
- React 18+ with TypeScript
- Webpack for bundling
- ESLint for linting
- Jest for testing
- Docker for containerization
- GitHub Pages for deployment

## Code Style Guidelines
1. **Imports**
   - Sort all imports alphabetically
   - Group imports: React, third-party, local

2. **Documentation**
   - Add TSDoc comments for all functions and components
   - Include @param and @returns tags when applicable

3. **Accessibility**
   - Ensure WCAG 2.2 AA compliance
   - Support screen readers
   - Use semantic HTML elements
   - Include proper ARIA attributes

4. **Styling**
   - Prefer direct element styling over CSS classes
   - Keep styles minimal and terminal-like
   - Use monospace fonts and terminal colors
   - Avoid complex CSS selectors

5. **Best Practices**
   - No console statements in production code
   - Add newline at end of files
   - No trailing spaces
   - Keep dependencies minimal
   - Use modern React patterns (hooks, functional components)

## Example Component Structure
```typescript
/**
 * Terminal-style component description
 * @param props - Component props description
 * @returns Terminal-styled React component
 */
const TerminalComponent: React.FC<Props> = ({ props }) => {
  // Component logic
  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* Component content */}
    </div>
  );
};
```
