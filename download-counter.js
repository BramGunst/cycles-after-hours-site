/* Count every published build across both repositories, including individual builds and prereleases. */
(() => {
  "use strict";
  const counter = document.querySelector("[data-download-counter]");
  if (!counter) return;
  const number = counter.querySelector("[data-download-total]");
  const repositories = ["BramGunst/cycles-after-hours", "BramGunst/cycles-after-hours-site"];
  const cacheKey = "cah-downloads-v3";
  const retryKey = "cah-downloads-v3-retry-after";
  const cooldown = 5 * 60 * 1000;
  const integer = (value) => Number.isSafeInteger(value) && value >= 0;
  const auxiliary = /(?:^|[-_.])(?:source|src|checksums?|sha\d+|provenance|docs?|documentation|licenses?|patches?|symbols?|debug|pdb|dependencies|deps|sdk|tests?)(?:[-_.]|$)/i;
  const packageFile = /\.(?:zip|7z|tar\.(?:xz|gz|bz2|zst)|dmg|pkg|exe|msi|appimage)$/i;
  const product = /^(?:cycles[-_]after[-_]hours|blender)(?:[-_]|$)/i;
  const platform = /(?:^|[-_])(?:windows|win64|win32|linux|macos|mac|darwin|osx)(?:[-_.]|$)/i;

  function isBinary(asset) {
    if (asset.state !== "uploaded" || auxiliary.test(asset.name) || !packageFile.test(asset.name)) return false;
    // Unknown archives are ambiguous: hide the total rather than silently omit a build.
    if (!product.test(asset.name) || (!platform.test(asset.name) && !/\.(?:dmg|pkg|exe|msi|appimage)$/i.test(asset.name))) {
      throw new Error("Unrecognized binary package");
    }
    return true;
  }

  function totalFor(snapshot) {
    if (!snapshot || snapshot.schema !== 1 || snapshot.complete !== true ||
        !Array.isArray(snapshot.repositories) || snapshot.repositories.length !== repositories.length) {
      throw new Error("Incomplete download data");
    }
    let total = 0;
    const assets = new Map();
    snapshot.repositories.forEach((repo, index) => {
      if (repo.name !== repositories[index] || !Array.isArray(repo.releases)) throw new Error("Missing repository");
      const releaseIDs = new Set();
      repo.releases.forEach((release) => {
        if (!integer(release.id) || release.draft !== false || typeof release.prerelease !== "boolean" ||
            !Number.isFinite(Date.parse(release.published_at)) || !Array.isArray(release.assets) || releaseIDs.has(release.id)) {
          throw new Error("Invalid release data");
        }
        releaseIDs.add(release.id);
        release.assets.forEach((asset) => {
          if (!integer(asset.id) || typeof asset.name !== "string" || !integer(asset.download_count) ||
              !["uploaded", "starter"].includes(asset.state) || typeof asset.browser_download_url !== "string" ||
              !asset.browser_download_url.startsWith(`https://github.com/${repo.name}/releases/download/`)) {
            throw new Error("Invalid asset data");
          }
          const identity = JSON.stringify([asset.name, asset.state, asset.download_count, asset.browser_download_url]);
          if (assets.has(asset.id)) {
            if (assets.get(asset.id) !== identity) throw new Error("Conflicting asset data");
            return;
          }
          assets.set(asset.id, identity);
          if (isBinary(asset)) total += asset.download_count;
          if (!integer(total)) throw new Error("Invalid download total");
        });
      });
    });
    return total;
  }

  function show(snapshot) {
    const checkedAt = Date.parse(snapshot?.checkedAt);
    if (!Number.isFinite(checkedAt)) throw new Error("Invalid download timestamp");
    number.textContent = new Intl.NumberFormat("en-GB").format(totalFor(snapshot));
    counter.title = "Build downloads across all official, individual and experimental releases. " +
      `Last checked ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(checkedAt)}.`;
    counter.hidden = false;
    return checkedAt;
  }

  async function allPages(endpoint) {
    const items = [];
    const ids = new Set();
    for (let page = 1; ; page++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${endpoint}?per_page=100&page=${page}`, {
          signal: controller.signal, headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error("GitHub unavailable");
        const data = await response.json();
        if (!Array.isArray(data) || data.length > 100) throw new Error("Invalid page");
        for (const item of data) {
          if (!item || !integer(item.id) || ids.has(item.id)) throw new Error("Incomplete or overlapping pages");
          ids.add(item.id);
          items.push(item);
        }
        const links = response.headers.get("Link") || "";
        const next = links.split(",").find((link) => /;\s*rel="next"/.test(link));
        if (next) {
          const match = next.match(/<([^>]+)>/);
          if (!match) throw new Error("Invalid pagination");
          const url = new URL(match[1]);
          if (`${url.origin}${url.pathname}` !== endpoint || url.searchParams.get("page") !== String(page + 1) ||
              url.searchParams.get("per_page") !== "100" || data.length === 0) throw new Error("Incomplete pagination");
        }
        if (!next && data.length < 100) return items;
      } finally { clearTimeout(timeout); }
    }
  }

  async function loadRepository(name) {
    const endpoint = `https://api.github.com/repos/${name}/releases`;
    const releases = await allPages(endpoint);
    if (releases.some((release) => typeof release.draft !== "boolean")) throw new Error("Invalid release");
    const published = await Promise.all(releases.filter((release) => !release.draft).map(async (release) => {
      // Fetch the paginated asset endpoint too, rather than assume embedded assets are complete.
      const assets = await allPages(`${endpoint}/${release.id}/assets`);
      return { id: release.id, draft: false, prerelease: release.prerelease,
        published_at: release.published_at, assets: assets.map((asset) => ({
          id: asset.id, name: asset.name, state: asset.state,
          download_count: asset.download_count, browser_download_url: asset.browser_download_url,
        })) };
    }));
    return { name, releases: published };
  }

  let verifiedAt = -Infinity;
  let cachedAt = -Infinity;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey));
    const age = Date.now() - Date.parse(cached?.checkedAt);
    if (age >= 0) {
      cachedAt = show(cached);
      verifiedAt = cachedAt;
    }
  } catch { /* Invalid or unavailable storage must not affect release cards. */ }
  try {
    const bundled = window.CAH_DOWNLOAD_SNAPSHOT;
    if (Date.parse(bundled?.checkedAt) > verifiedAt) verifiedAt = show(bundled);
  } catch { /* A missing saved snapshot must not prevent a live refresh. */ }
  if (Number.isFinite(cachedAt) && cachedAt === verifiedAt && Date.now() - cachedAt < cooldown) return;
  try {
    const retryAfter = Number(localStorage.getItem(retryKey));
    if (Number.isFinite(retryAfter) && retryAfter > Date.now() && retryAfter <= Date.now() + cooldown) return;
  } catch { /* Storage is optional. */ }

  (async () => {
    try {
      const data = await Promise.all(repositories.map(loadRepository));
      const snapshot = { schema: 1, complete: true, checkedAt: new Date().toISOString(), repositories: data };
      verifiedAt = show(snapshot);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(snapshot));
        localStorage.setItem(retryKey, "0");
      } catch { /* The verified live total works without persistent storage. */ }
    } catch {
      counter.hidden = !Number.isFinite(verifiedAt);
      try { localStorage.setItem(retryKey, String(Date.now() + cooldown)); } catch { /* Optional backoff. */ }
    }
  })();
})();
