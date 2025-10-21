import React, { useState, useRef, useEffect } from 'react';

// GoogleStyleSlider.jsx
// Componente React autosuficiente que imita la experiencia de una barra deslizante "tipo Google".
// Requisitos: TailwindCSS (opcional) — utiliza clases Tailwind para diseño; si no usas Tailwind,
// las clases siguen siendo útiles como guía y los estilos inline mantienen funcionalidad.

export default function GoogleStyleSlider({
  min = 1,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 50,
  onChange,
  showValue = true,
  className = '',
}) {
  const isControlled = controlledValue !== undefined;
  const [value, setValue] = useState(isControlled ? controlledValue : defaultValue);
  const rangeRef = useRef(null);
  const thumbRef = useRef(null);

  // Keep internal state in sync if controlled
  useEffect(() => {
    if (isControlled) setValue(controlledValue);
  }, [controlledValue, isControlled]);

  // Update CSS variable for the filled portion
  useEffect(() => {
    const el = rangeRef.current;
    if (!el) return;
    const pct = ((value - min) / (max - min)) * 100;
    el.style.setProperty('--pct', pct + '%');
  }, [value, min, max]);

  function handleChange(e) {
    const val = Number(e.target.value);
    if (!isControlled) setValue(val);
    if (onChange) onChange(val);
  }

  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="relative px-2 py-6">{/* padding top so tooltip has space */}
        {/* Tooltip */}
        {showValue && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translateX(calc(var(--pct) - 50%))`,
            }}
          >
            <div className="select-none inline-block px-3 py-1 rounded-md shadow-md text-sm font-medium bg-white border">
              {value}
            </div>
            <div className="w-2 h-2 mx-auto mt-1 rotate-45 bg-white border" style={{ borderLeftWidth: 1, borderTopWidth: 1 }} />
          </div>
        )}

        {/* Range input container */}
        <div className="relative">
          {/* Styled track with filled portion using CSS variable --pct */}
          <div className="absolute inset-0 flex items-center" style={{ height: 6 }}>
            <div className="w-full rounded-full bg-gray-200 h-1.5 overflow-hidden">
              <div
                style={{ width: 'var(--pct)' }}
                className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
          </div>

          {/* Actual input range - visually transparent but accessible */}
          <input
            ref={rangeRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-label="Seleccionar valor"
            className={`w-full appearance-none bg-transparent h-6 focus:outline-none`} 
            style={{
              // Improve click/touch target
              WebkitAppearance: 'none',
              height: 24,
            }}
          />

          {/* Custom thumb for visuals (not strictly necessary) */}
          {/* We place an invisible thumb over the slider using the same --pct variable */}
          <div
            ref={thumbRef}
            className="absolute top-1/2 z-10 -translate-y-1/2 shadow-sm"
            style={{
              left: 'var(--pct)',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-md" style={{ background: 'linear-gradient(180deg,#3b82f6,#4f46e5)' }} />
          </div>
        </div>

        {/* Min / Max labels */}
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Small helper to show value below for keyboard users */}
      <div className="sr-only" aria-live="polite">Valor actual: {value}</div>
    </div>
  );
}

/*
Notes y recomendaciones:
- El componente utiliza una variable CSS --pct (0%..100%) para posicionar el tooltip,
  la porción rellenada y el pulgar visual.
- Usa Tailwind para layout y clases utilitarias. Si no usas Tailwind, conserva el componente
  y añade estilos equivalentes en tu CSS.
- El input range sigue siendo el control real (accesible y usable por teclado). La parte
  visual (tooltip, thumb) está sincronizada mediante la variable CSS y el estado.
- Props útiles: onChange(value), value (controlado), defaultValue, min/max/step.
- Si quieres que el tooltip siga mejor el pulgar en pantallas pequeñas, puedo añadir
  un cálculo JS que coloque el tooltip en px exactos usando getBoundingClientRect().
*/
