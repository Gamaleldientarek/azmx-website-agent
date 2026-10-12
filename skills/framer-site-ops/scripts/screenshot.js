// Framer exec script: screenshot a node on the canvas, or a page of the live or preview site, desktop and phone.
//   npx -y @framer/agent@latest exec -s <id> -e 'state.settings = { url: "https://<site>/<path>?cb=1", phone: true }'      (live or preview page)
//   npx -y @framer/agent@latest exec -s <id> -e 'state.settings = { id: "<node id>" }'                                      (canvas node)
//   npx -y @framer/agent@latest exec -s <id> < screenshot.js
// readProject returns { results: [...] } in query order; each screenshot result carries image_url. URLs must be public.
const SETTINGS = state.settings;
if (!SETTINGS || (!SETTINGS.id && !SETTINGS.url) || /^<|>$/.test(String(SETTINGS.id || SETTINGS.url))) {
  throw new Error('Set state.settings first: exec -s <id> -e \'state.settings = { url: "https://…?cb=1", phone: true }\' or { id: "<node id>" }');
}
delete state.settings;
const queries = [];
if (SETTINGS.id) queries.push({ type: "screenshot", id: SETTINGS.id });
if (SETTINGS.url) {
  queries.push({ type: "screenshot", url: SETTINGS.url });
  if (SETTINGS.phone !== false) queries.push({ type: "screenshot", url: SETTINGS.url + (SETTINGS.url.includes("?") ? "&" : "?") + "cb=phone", viewport: { width: 390, height: 844 } });
}
const { results } = await framer.agent.readProject(queries);
state.lastScreenshots = results;
results.forEach((r, i) => console.log(`${i}: ${(r && r.image_url) || JSON.stringify(r).slice(0, 300)}`));
