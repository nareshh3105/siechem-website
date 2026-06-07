/**
 * FILE: SiechemApp.jsx
 *
 * PURPOSE:
 *   Root React component for the React prototype (siechem-redesign-2d.html).
 *   Composes all section components into a single page and wires up the TweaksPanel
 *   design controls. This is the entry point that ReactDOM.createRoot() mounts.
 *
 * WHAT IT DOES:
 *   1. Reads the TWEAK_DEFAULTS object (defined in the /*EDITMODE-BEGIN*/ block)
 *      for live design editing — the Claude design tool can rewrite this block to
 *      persist tweaks across page reloads.
 *   2. Calls useTweaks(TWEAK_DEFAULTS) → returns [t, setTweak] where `t` holds the
 *      current accent colour and density, and setTweak updates them and posts the
 *      change to the parent frame (for the host's EDITMODE persistence).
 *   3. Renders the full page in order:
 *        <SiechemNav />     — sticky header with search
 *        <SiechemHero />    — hero section with rotating taglines and stats
 *        <SiechemSegments /> — product segment cards (6 markets)
 *        <SiechemCalculator /> — AWG ↔ mm² tool
 *        <SiechemCapabilities /> — manufacturing highlights and "Why Siechem"
 *        <SiechemFooter />  — full-width footer with site map
 *        <TweaksPanel />    — floating design tweak panel (only visible in edit mode)
 *   4. The TweaksPanel contains:
 *        - Brand Accent colour picker (red, blue, green, purple presets)
 *        - Layout Density toggle (Spacious / Compact)
 *      All changes propagate down to every component via the `accent` prop.
 *
 * EDITMODE BLOCK:
 *   The /* EDITMODE-BEGIN * / ... /* EDITMODE-END * / markers around TWEAK_DEFAULTS
 *   are a convention from the Claude design tool. The host can rewrite the JSON
 *   between these markers to persist tweak values across sessions. Do not remove
 *   these markers or the host won't be able to save design changes.
 *
 * INLINE STYLE:
 *   A <style> tag is injected for two keyframe animations (fadeSlideDown, fadeIn)
 *   and a minor polish for number inputs and select dropdowns. These can't live in
 *   theme.css because they're specific to the React prototype's interactions.
 *
 * NOTE:
 *   This file is only loaded by siechem-redesign-2d.html as a <script type="text/babel">.
 *   The production static site does not use this file at all.
 */
const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#E31E24",
  "density": "comfortable"
}/*EDITMODE-END*/;

function SiechemApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.5; }
        select option { background: #1E293B; color: #F8FAFC; }
      `}</style>

      <SiechemNav accent={t.accent} />
      <SiechemHero accent={t.accent} />
      <SiechemSegments accent={t.accent} />
      <SiechemCalculator accent={t.accent} />
      <SiechemCapabilities accent={t.accent} />
      <SiechemFooter accent={t.accent} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand Accent" />
        <TweakColor
          label="Accent Color"
          value={t.accent}
          options={['#E31E24','#2563EB','#059669','#7C3AED']}
          onChange={v => setTweak('accent', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={[{ value: 'comfortable', label: 'Spacious' }, { value: 'compact', label: 'Compact' }]}
          onChange={v => setTweak('density', v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SiechemApp />);
