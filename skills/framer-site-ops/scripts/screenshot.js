// Framer exec script: screenshot a node on the canvas or a page of the live or preview site, desktop and phone.
// Usage: edit SETTINGS, then npx -y @framer/agent@latest exec -s <id> < screenshot.js
const SETTINGS = {
  id: "",                                  // a node id to screenshot the canvas, or leave empty and set url
  url: "",                                 // a full URL of the live or preview site; add ?cb=1 to defeat the cache
  phone: true,                             // also take a 390×844 phone screenshot
};
const queries = [];
if (SETTINGS.id) queries.push({ type: "screenshot", id: SETTINGS.id });
if (SETTINGS.url) {
  queries.push({ type: "screenshot", url: SETTINGS.url });
  if (SETTINGS.phone) queries.push({ type: "screenshot", url: SETTINGS.url + (SETTINGS.url.includes("?") ? "&" : "?") + "cb=phone", viewport: { width: 390, height: 844 } });
}
if (!queries.length) throw new Error("Set SETTINGS.id or SETTINGS.url.");
const results = await framer.agent.readProject(queries);
state.lastScreenshots = results;
results.forEach((r, i) => console.log(`${i}: ${r.image_url || JSON.stringify(r).slice(0, 300)}`));
