// Framer exec script: the active branch and every branch, in one run.
// Usage: npx -y @framer/agent@latest exec -s <id> < branch-status.js
const active = await framer.agent.getActiveBranch();
const branches = await framer.agent.getBranches();
state.activeBranch = active;
console.log(JSON.stringify({ active, branches }, null, 2));
