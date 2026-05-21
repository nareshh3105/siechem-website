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
