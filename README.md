# Cellular Material Study — Clinical Beauty Visualizer

Fictional healthcare/beauty editorial concept. No medical product, clinical data, efficacy, pharmacology, or treatment simulation is claimed.

## Run

`npm install` then `npm run dev`; `npm run build` for a production build.

## Design choices

Warm ivory `#f6f4ef`, sage `#3f6254`, no postprocessing/bloom, 80 deterministic Fibonacci-direction particles, restrained matte shader with Fresnel rim, glass roughness 0.38. Pointer orbit and timeline use R3F/React state; motion toggle respects initial reduced-motion preference.

## Verification

Inspect on desktop/mobile, keyboard, reduced motion, browser console and WebGL fallback. No FPS claim without measurement.
