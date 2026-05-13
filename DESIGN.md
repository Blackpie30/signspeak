# Sign Language Translator — Design Brief

## Tone & Differentiation
Accessibility-first tool with zero decoration. Camera-centric interface emphasizing live gesture input, real-time text translation, and audio playback. High contrast, clear focus states, keyboard navigation support. Every pixel serves clarity, not aesthetics.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Purpose |
|-------|-----------|----------|----------|
| Background | 0.98 0 0 | 0.09 0 0 | Page foundation; accessibility contrast base |
| Foreground | 0.15 0 0 | 0.95 0 0 | Primary text; AA+ on background |
| Card | 0.95 0 0 | 0.12 0 0 | Elevated sections; status bar, translation output |
| Primary (Blue) | 0.4 0.2 258 | 0.65 0.22 258 | Buttons, interactive elements, focus ring |
| Success (Green) | 0.6 0.22 140 | 0.7 0.22 140 | Confidence scores, positive recognition feedback |
| Destructive (Red) | 0.55 0.22 25 | 0.6 0.2 25 | Errors, warnings |
| Muted | 0.88 0.02 0 | 0.22 0.02 0 | Secondary text, disabled states |
| Border | 0.85 0.02 0 | 0.2 0.02 0 | Section dividers, input borders |

## Typography
**Display & Body:** GeneralSans (modern, highly legible sans-serif)
**Mono:** GeistMono (crisp monospace for translated text output)
**Scale:** 16px body, 20px heading, 14px secondary

## Shape & Depth
Default border-radius: 8px (lg). Sharp borders define structural zones. No shadows—depth via color, borders, and negative space. Card backgrounds create natural hierarchy.

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|----------|
| Header | Card bg, border-b | App title, controls |
| Camera Feed | Black bg, 2px border, aspect-video | Hero gesture input |
| Translation Output | Card bg, mono font, green accent on confidence | Live recognized text & score |
| Audio Controls | Primary button, centered | Play/stop synthesized speech |
| History | Scrollable list, alternating card/muted bg | Recent translations with timestamps |

## Responsive
Mobile-first. Camera feed scales to fill available width. Translation output and history stack vertically on mobile, side-by-side on tablet+.

## Motion
Smooth transitions on all interactive elements (0.3s cubic-bezier). Focus ring on keyboard navigation. No animations—clarity prioritized over delight.

## Dark Mode
Default dark mode (app context: low-light environments, camera use). Light mode supported; uses same palette (L values inverted). Tested for WCAG AA+ contrast.

## Accessibility
High contrast (foreground L diff ≥ 0.7 from background). Keyboard-navigable buttons with visible focus rings. Alt text on camera canvas. ARIA labels for status updates. Voice feedback compatible with screen readers.

## Constraints
No gradients, no blur, no overlays. Flat design with color-based hierarchy. Single accent per state. Mono font reserved for translation output only—reinforces "recognized text" semantic.
