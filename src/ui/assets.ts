// Asset paths, resolved against Vite's base URL (works on GitHub Pages sub-paths).



// Absolute URL: these paths are also used inside CSS custom properties (masks, backgrounds),
// where a relative URL would be resolved against the stylesheet instead of the page.
export const asset = (path: string): string => new URL(`${import.meta.env.BASE_URL}assets/${path}`, document.baseURI).href;

export const img = (name: string): string => asset(`img/${name}.png`);

