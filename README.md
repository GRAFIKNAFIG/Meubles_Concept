# Meubles Concept

A multi-platform furniture design PWA built with React, TypeScript, Three.js, and Vite.

## Features

- **Studio** – Design furniture (shelves, wardrobes) with millimeter precision; live 3D preview with multiple camera views; export to GLB.
- **Showroom** – Browse and manage saved furniture designs with full 3D viewer.
- **Room Planner** – 2D SVG floor-plan editor; drag-and-drop furniture placement with grid snapping and overlap detection.
- **PWA** – Offline-capable via Workbox service worker; installable on desktop and mobile.
- **i18n** – French and Romanian localisations via i18next.
- **Local persistence** – All designs and rooms stored in IndexedDB via `idb`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + React Router 6 |
| 3D | Three.js 0.163 + OrbitControls |
| Build | Vite 5 + TypeScript 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Storage | IndexedDB via `idb` |
| i18n | i18next + react-i18next |

## Getting Started

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
```
