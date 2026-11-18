# Lessons from building the first two report pages (17–18 Nov 2026)

Framer agent behaviour met on these pages. The general list is [framer-site-ops › gotchas from the record](../../framer-site-ops/references/gotchas-from-the-record.md); copy a lesson there too when it isn't report-specific.

- A frame created with any `hoverEffect.*` grows 10 % unless `hoverEffect.scale` is sent.
- `visible` can't bind a link field directly: `visible.from="var(--variable-<id>)" visible.transforms.0.name="isSet"`.
- A site path in a CMS link field gets `/en` added on English pages; a page link inside rich text (`link.href="/services/:slug" link.collectionItem="<slug>"`) does too.
- A phrase link inside a paragraph = split the TextRun: set the first run to the text before, add a run with the link, add a run with the text after; set `linkStylePreset` on the RichTextNode. The paragraph's English value must then be rebuilt around the same `<a>`.
- `gap` is refused with `stackDistribution="space-between"` (the node is still created); on a breakpoint SET, send `stackDistribution="start"` with the gap.
- Text overrides on breakpoint copies and component variants: one SET per `applyChanges`, or they are dropped.
- Temporary ids must be created in the same `applyChanges` call as their children; don't split a section across calls.
- New CMS fields bind only in a new session.
- `textAlignment="start"` can be missing from the published code while the API reads it back as start: write `left` then `start` to force it.
- The Label/Large Heading text style renders as H2 unless the text block's tag is set to `p`.
- A page or template with `metadata.noIndexSite` set (even false) served the site's default description and dropped canonical and hreflang. Clear it with `metadata.noIndexSite=null`.
- `page_fetch` and curl right after a branch publish can read the pre-render shell (site default title, 0 words). Read again a minute later, or check in the browser.
- A browser pane that is hidden runs animations slowly: measure positions instead of trusting screenshots.
- The guard needs literal script paths (no `$VAR`), and a script file must exist before `exec < file`.
