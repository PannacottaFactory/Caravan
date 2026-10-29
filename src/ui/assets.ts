// Asset paths, resolved against Vite's base URL (works on GitHub Pages sub-paths).

import type { ResourceId } from '../engine';

export const asset = (path: string): string => `${import.meta.env.BASE_URL}assets/${path}`;

export const img = (name: string): string => asset(`img/${name}.png`);

export const resourceIcon = (id: ResourceId): string => img(`res-${id}`);
export const itemIcon = (id: string): string => img(`item-${id}`);
export const powerIcon = (id: string): string => img(`power-${id}`);
