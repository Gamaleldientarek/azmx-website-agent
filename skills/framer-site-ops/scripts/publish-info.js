// Framer exec script: when was the site last published, without publishing anything.
// Usage: npx -y @framer/agent@latest exec -s <id> < publish-info.js
const info = await framer.getPublishInfo();
state.publishInfo = info;
console.log(JSON.stringify(info, null, 2));
