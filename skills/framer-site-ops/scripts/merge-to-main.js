// Framer exec script: merge the active branch into main and confirm it is gone. Run serialize-nodes.js and diff-json.mjs on the branch first.
// Usage: npx -y @framer/agent@latest exec -s <id> < merge-to-main.js
const mainName = (() => { try { return JSON.parse(require("fs").readFileSync("site-agent.json", "utf8")).framer.mainBranch || "main"; } catch { return "main"; } })();
const branch = await framer.agent.getActiveBranch();
if (!branch || branch.id === mainName || branch.title === mainName) throw new Error("Already on main; nothing to merge.");
const name = branch.title || branch.id;
const merged = await framer.agent.mergeBranch(mainName);
const branches = await framer.agent.getBranches();
const still = branches.find(b => b.id === branch.id);
const active = await framer.agent.getActiveBranch();
state.lastMerge = { from: name, merged, stillExists: !!still, activeAfter: active };
console.log(JSON.stringify({ mergedFrom: name, result: merged, branchStillListed: !!still, activeBranchNow: active && (active.title || active.id) }, null, 2));
if (still) console.log("The branch is still listed. Do not report the merge as done until it is gone; re-read on main in a new run.");
