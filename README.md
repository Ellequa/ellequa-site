# Ellequa

An image-led editorial portfolio built with Astro. The homepage lives in `src/pages/index.astro`; original photography is kept in `public/images/`.

## Local development

- `npm install`
- `npm run dev -- --background`
- Open http://localhost:4321
- `npm run astro -- dev status`
- `npm run astro -- dev logs`
- `npm run astro -- dev stop`

## Production

Run `npm run build` to generate the static site in `dist/`.

Images are imported from the original, verified filenames and processed by Astro into responsive WebP variants. Keep the originals: the build generates optimized copies automatically. Portrait and landscape proportions are preserved. Only the opening photograph loads eagerly; the remaining photographs load lazily.

The Collection navigation links to the homepage collection. Both homepage Archive links open `/archive/`, authored in `src/pages/archive.astro`. The external private destination appears only on that archive page.

`backups/index-backup-working.astro` preserves the earlier design outside the pages directory so it is not published as another route.
