// Only compiled entry assets and approved static asset types belong in dist.
// Vite copies public/ verbatim, so fail the build on unexpected exports or files.
export function isPublishableAsset(path) {
  if (["index.html", "robots.txt", "favicon.svg", "_headers"].includes(path))
    return true;
  if (["fonts/BARLOW-LICENSE.txt", "images/BOOTSTRAP-ICONS-LICENSE.txt"].includes(path))
    return true;
  return /^(?:assets\/[\w-]+\.(?:js|css)|images\/[\w-]+\.(?:webp|avif|png|jpe?g)|fonts\/[\w-]+\.woff2)$/.test(
    path
  );
}
