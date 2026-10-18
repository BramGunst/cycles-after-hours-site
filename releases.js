/* Shared release presentation. GitHub data is inserted as text, never HTML. */
(() => {
  "use strict";
  const repository = "https://github.com/BramGunst/cycles-after-hours";
  const api = "https://api.github.com/repos/BramGunst/cycles-after-hours/releases";
  const cacheKey = "cah-releases-v1";
  const retryKey = "cah-releases-retry-after";
  const cooldown = 15 * 60 * 1000;
  const snapshot = window.CAH_RELEASE_SNAPSHOT;
  if (!snapshot) return;

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const safeURL = (url) => typeof url === "string" && url.startsWith(`${repository}/`);
  const validRelease = (release) => release && !release.draft &&
    typeof release.tag_name === "string" && safeURL(release.html_url) &&
    Number.isFinite(Date.parse(release.published_at)) && Array.isArray(release.assets) &&
    release.assets.every((asset) => typeof asset.name === "string" && safeURL(asset.browser_download_url));
  const assetsFor = (release) => release.assets.filter((asset) => asset.state === "uploaded");
  const isSource = (asset) => /(?:^|[-_])source(?:[-_.]|$)/i.test(asset.name);
  const buildsFor = (release) => assetsFor(release).filter((asset) => !isSource(asset) &&
    /\.(?:zip|7z|tar\.(?:xz|gz|bz2|zst)|dmg|pkg|exe|msi|appimage)$/i.test(asset.name));
  const version = (release) => release.tag_name.match(/v\d[\w.+-]*$/)?.[0] || release.tag_name;
  const title = (release) => (release.name || release.tag_name)
    .replace(/^Cycles After Hours\s*[-–:]\s*/i, "").replace(/\s+v\d[\w.+-]*$/, "");
  const date = (value) => new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(value));
  const platform = (asset) => {
    const match = asset.name.match(/(Windows|Linux|macOS)[-_](x64|arm64|x86_64)/i);
    return match ? `${match[1]} ${match[2]}` : asset.label || asset.name;
  };
  const compatibility = (release) => {
    const body = release.body || "";
    return {
      blender: body.match(/Blender\s+\d+\.\d+(?:\.\d+)?(?:\s+LTS)?/i)?.[0],
      devices: body.match(/Cycles\s+CPU(?:\s*[,/]|\s+and)\s*(?:CUDA)(?:\s*[,/]|\s+and)\s*OptiX/i)?.[0],
    };
  };
  const link = (label, href, className) => {
    const node = element("a", className, label);
    node.href = href;
    return node;
  };
  const checksum = (asset) => /^sha256:[a-f\d]{64}$/i.test(asset.digest || "")
    ? asset.digest.slice(7).toUpperCase() : null;

  function renderBuildCard(card, release, { feature = false } = {}) {
    const fragment = document.createDocumentFragment();
    const experimental = card.dataset.buildCard === "experimental";
    const heading = element("div", "release-heading");
    heading.append(element(feature || experimental ? "h3" : "h2", "", feature || experimental ? title(release) : "Current Build"));
    if (!feature) heading.append(element("span", "status-badge status-badge--latest", "Latest"));
    fragment.append(heading);
    const info = compatibility(release);
    const builds = buildsFor(release);
    const list = element("ul");
    [feature || experimental ? null : title(release), info.blender, builds.map(platform).join(" / "), `Version ${version(release)}`, info.devices,
      feature || experimental ? `Released ${date(release.published_at)}` : null]
      .filter(Boolean).forEach((text) => list.append(element("li", "", text)));
    fragment.append(list);
    const primary = builds[0];
    if (!feature && primary && checksum(primary)) {
      fragment.append(element(experimental ? "h4" : "h3", "", "Checksums"));
      const paragraph = element("p", "", `${platform(primary)} SHA-256: `);
      paragraph.append(element("code", "", checksum(primary)));
      fragment.append(paragraph);
    }
    const actions = element("div", "build-actions");
    builds.forEach((asset) => actions.append(link(`Download ${version(release)}`,
      asset.browser_download_url, "button download-button")));
    if (!builds.length) actions.append(link("View release assets", release.html_url, "button"));
    const source = assetsFor(release).find(isSource);
    if (source) actions.append(link("Source Code", source.browser_download_url, "button"));
    actions.append(link(feature || experimental ? "Release Notes" : "View on GitHub", feature || experimental ? release.html_url : repository, "button"));
    fragment.append(actions);
    card.replaceChildren(fragment);
  }

  // Release tags identify a feature series, e.g. viewport-motion-blur-v0.2.2.
  const featureKey = (release) => release.tag_name.replace(/[-_]v?\d.*$/i, "").toLowerCase();

  function renderFeatureBuilds(published) {
    const features = new Map();
    published.filter((release) => !release.prerelease && buildsFor(release).length)
      .sort((a, b) => Date.parse(a.published_at) - Date.parse(b.published_at))
      .forEach((release) => {
        const key = featureKey(release);
        features.set(key, release);
      });
    document.querySelectorAll("[data-feature-builds]").forEach((container) => {
      container.replaceChildren();
      features.forEach((release) => {
        const card = element("article", "details-card");
        renderBuildCard(card, release, { feature: true });
        container.append(card);
      });
      if (!features.size) container.append(link("View individual builds", `${repository}/releases`));
    });
  }

  function render(state, live = false, message = "") {
    const published = state.releases.filter(validRelease);
    const release = published.find((item) => item.tag_name === state.latestTag && !item.prerelease);
    if (!release) return;
    document.querySelectorAll("[data-build-card]").forEach((card) => renderBuildCard(card, release));
    renderFeatureBuilds(published);
    document.querySelectorAll("[data-release-download]").forEach((node) => {
      const build = buildsFor(release)[0];
      node.href = build?.browser_download_url || release.html_url;
      if (!node.classList.contains("setup-download")) node.textContent = `Download ${version(release)}`;
    });
    document.querySelectorAll("[data-release-notes]").forEach((node) => { node.href = release.html_url; });
    document.querySelectorAll("[data-release-meta]").forEach((node) => {
      node.textContent = [compatibility(release).blender, buildsFor(release).map(platform).join(" / ")].filter(Boolean).join(" | ");
    });
    document.querySelectorAll("[data-release-note-description]").forEach((node) => {
      node.textContent = `Changes in ${version(release)}.`;
    });
    document.querySelectorAll("[data-release-status]").forEach((node) => {
      node.textContent = live ? "Latest release verified with GitHub." : message ||
        `Saved release information from ${date(state.checkedAt)}. Check GitHub for newer builds.`;
    });
    document.querySelectorAll("[data-prereleases]").forEach((node) => {
      node.replaceChildren();
      const prereleases = published.filter((item) => item.prerelease && buildsFor(item).length);
      prereleases.forEach((item) => {
        const card = element("article", "details-card prerelease-card");
        card.append(element("span", "status-badge status-badge--experimental", "Experimental"),
          element("h3", "", `${title(item)} ${version(item)}`), element("p", "", `Prerelease · ${date(item.published_at)}`));
        const actions = element("div", "build-actions");
        buildsFor(item).forEach((asset) => actions.append(link(`Download for ${platform(asset)}`, asset.browser_download_url, "button")));
        actions.append(link("Release notes", item.html_url, "button"));
        card.append(actions);
        node.append(card);
      });
      node.hidden = !prereleases.length;
    });
  }

  let cached;
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey));
    if (value && Array.isArray(value.releases) && value.releases.every(validRelease) &&
        value.releases.some((release) => release.tag_name === value.latestTag && !release.prerelease) &&
        Number.isFinite(Date.parse(value.checkedAt))) cached = value;
  } catch { /* Private browsing and invalid storage must not break downloads. */ }
  const initial = cached && Date.parse(cached.checkedAt) > Date.parse(snapshot.checkedAt) ? cached : snapshot;
  render(initial);

  async function request(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  async function refresh() {
    // The latest endpoint is authoritative; release-list order is not.
    const [latestResult, historyResult] = await Promise.allSettled([request(`${api}/latest`), request(`${api}?per_page=100`)]);
    if (latestResult.status !== "fulfilled" || !validRelease(latestResult.value) || latestResult.value.prerelease) {
      try { localStorage.setItem(retryKey, String(Date.now() + cooldown)); } catch { /* Optional backoff. */ }
      render(initial, false, "GitHub could not be checked. Saved downloads remain available; check GitHub for newer builds.");
      return;
    }
    const latest = latestResult.value;
    const historyLive = historyResult.status === "fulfilled" && Array.isArray(historyResult.value) && historyResult.value.every(validRelease);
    const history = historyLive ? historyResult.value : initial.releases;
    const state = { checkedAt: new Date().toISOString(), latestTag: latest.tag_name,
      releases: [latest, ...history.filter((item) => item.tag_name !== latest.tag_name)], historyLive };
    render(state, true);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(state));
      localStorage.setItem(retryKey, "0");
    } catch { /* Optional cache. */ }
  }
  const age = cached ? Date.now() - Date.parse(cached.checkedAt) : Infinity;
  let retryAfter = 0;
  try { retryAfter = Number(localStorage.getItem(retryKey)) || 0; } catch { /* Optional backoff. */ }
  if (retryAfter > Date.now()) render(initial, false, "GitHub could not be checked recently. Saved downloads remain available; check GitHub for newer builds.");
  else if (age < 0 || age >= cooldown) refresh();
  else render(initial, false, `Release information checked ${date(cached.checkedAt)}. Check GitHub for the latest status.`);
})();
