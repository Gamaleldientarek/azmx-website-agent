// AZMX_SITE_BRANCH_PREVIEW
// Framer exec script: publish a BRANCH PREVIEW so the real site code can be screenshotted, without touching the live site.
// It refuses to run on main: on main, confirm_publish would publish the live site, which is the owner's decision.
// Usage: npx -y @framer/agent@latest exec -s <id> < branch-preview.js
const branch = await framer.agent.getActiveBranch();
const mainName = (() => { try { return JSON.parse(require("fs").readFileSync("site-agent.json", "utf8")).framer.mainBranch || "main"; } catch { return "main"; } })();
if (!branch || !branch.id || branch.id === mainName || branch.title === mainName) {
  throw new Error(`Refusing: the active branch is ${branch && (branch.title || branch.id)}. A preview is only published from a branch. Create or switch to a branch first.`);
}
const preview = await framer.agent.publish({ action: "preview" });
if (preview.errors && preview.errors.length) {
  console.log(JSON.stringify(preview, null, 2));
  throw new Error("Preview reported blocking errors; nothing was published.");
}
const result = await framer.agent.publish({ action: "confirm_publish", confirmationHash: preview.confirmationHash });
state.branchPreview = { branch, preview, result };
console.log(JSON.stringify({ branch: branch.title || branch.id, urls: { staging: preview.staging, production: preview.production }, result }, null, 2));
console.log("Screenshot it with readProject: [{ type: \"screenshot\", url: <staging url + path + '?cb=1'>, viewport: { width: 390, height: 844 } }]");
