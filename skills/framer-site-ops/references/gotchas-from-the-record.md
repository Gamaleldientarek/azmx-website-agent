# Gotchas from the record

Lessons the review log and the task list recorded while building this site, grouped by theme. Each one cost time once; none should cost it twice. Internal identifiers are left out on purpose; the website repository's own files name them.

## Branches and sessions

- A branch can disappear because the owner merged it in the editor. Find what changed by diffing main against the pre-change backup.
- Branches the session did not create are left untouched and named in the record.
- Code files are not branched: a change to a code file lands on main immediately and must be reverted separately.
- CMS writes (`addItems`, `setAttributes`, `addFields`) bypass branches, so two sessions editing the same project can collide silently. Agree page ownership between parallel sessions.
- A merge can silently fail: confirm the branch is gone from `getBranches()` and re-read on main in a new run before saying "merged".
- A proof-of-concept branch merged through the editor before the owner approved it had to be reverted. Proof-of-concept branches are merged by the owner only.
- A delegated agent only sees the latest message; approvals it claims for other requests are refused. Do approved changes in the main session.

## Writes that look successful and are not

- Writing the primary node and then every breakpoint copy to the same value reported success, but most edits were gone on the next read. Write the primary only and read back after each edit.
- Setting `formSelectOptions.N.*` one index at a time collapses the array. Set all options in one `SET`, on the primary and every breakpoint copy.
- `SET <layer> tag="p"` is accepted but ignored on CMS-bound text; the HTML tag comes from the text style. Create a text style with the wanted tag.
- A heading tag on CMS-bound text cannot be read back through the serializer; verify in the published HTML.
- `+TextStylePresetNode` adds five OpenType features and sets the largest breakpoint at 1440 px; null the features with `SET`, but the breakpoint only takes through `textStyle.setAttributes({ breakpoints })`.
- `metadata.noIndex="true"` works on a page although it is not in the DSL grammar.
- Stale virtual ids: `SET v:<node>:0:0` can fail with "virtual child no longer exists" even after a fresh read; `node.setText()` works and keeps the preset.
- A `maxWidth` cap is invisible to a width-only read; read `maxWidth` too when a size change does not take.
- Negative stack gaps do not render (saved as −8, drawn as 0); overlapping chips need absolute pins.
- Binding text to a CMS field after creation drops its text style; set the style in the same command as the binding.
- Hidden breakpoint overrides on an instance's image controls cannot be cleared by the API; recreate the instance and hide the old one.
- Some components cannot be read in one piece; read layer by layer.
- Pasted template image layers keep "Stretch" fit and the DSL has no fit attribute; use a fresh frame fill (cover) and hide the old layer.

## Breakpoints, copies and duplicates

- `DUPE` keeps desktop, small desktop and tablet and loses phone overrides. A copy also inherits the source's English strings and alt text; check every alt after duplicating.
- A new variant copies hidden tap actions that still point at the shared source variant; re-point them.
- Framer stores a separate image per breakpoint copy, so alt text must be set on every copy.
- Slot frames have no breakpoint replicas, so a "phone-only" fix in a slot shows on all sizes.
- Only the Desktop instance needs a new control value; the other replicas inherit it.

## Localization

- Changing an Arabic value (a control, a button label, a footer link) clears or creates empty English entries on that source; re-set the English afterwards.
- Setting the English of a shared Arabic string renames every node that carries it.
- Framer localizes only text, alt text and slugs: no per-language aria labels, no per-language link addresses, CMS link fields are not localizable, hidden form inputs get no translation entry.
- `addItems([{ slug, draft, fieldData }])` accepts `valueByLocale: { <localeId>: { action: "set", value } }` to set the English in the same call. Read locale ids from the project; never hard-code them.
- The localization percentage counts every CMS text value, so a large bilingual collection drags it down; marking fields "keep original" is a bulk change that needs the owner's yes.
- A component's sample texts (variable initial values) add strings to Localization.
- The canvas renders Arabic only; the English locale, hover states and the cookie banner's compact layout can only be checked on a preview or after a publish.

## CMS

- Drafts never appear in any list, and draft pages never publish. Saving fields on a draft clears the draft flag: restore it.
- Keep exactly one featured article: with two or more, every featured article vanishes from the grid.
- A list's `limit` caps Load More: article 15 onward never loads with a limit of 14. Dormant numbered pages must match the page size.
- Sorted lists break ties by CMS order; equal sort values keep their relative position.
- Fixed-slot lists (one list per slot, limit 1, offsets 0 to n) are how a slider or carousel shows CMS items one per slide; a new item needs a new slot in the component.
- One-item lists can be switches that show or hide a header; they are not content lists.
- Framer applies one and/or rule to all of a list's filters, so a search and a tab do not narrow together.
- Only CMS lists can filter and page; static design rows cannot.
- The API cannot delete a collection; the owner deletes it in the CMS. The project has a collection limit.
- CMS item ids are case-sensitive; look items up by slug.
- The live alt text of a CMS image comes from the image value itself: write `{ type: "image", value: url, alt }`.
- CMS formatted text accepts tables wrapped in `<figure>`; `setHTML` is not available, so rich text is rebuilt with `+TextBlock`, `+TextBulletList`, `+TextListItem`, `+TextRun`.
- A hidden form field cannot hold a CMS value (it freezes the first value).
- A CMS colour field cannot hold a colour style, and a colour cannot be driven from an option or reference field; connecting an option field to a code component's dropdown was done once in the editor, then the cases were written with `convertFromOption`.

## Layout and components

- `Button/Primary` carries a link on every variant root, so an instance inside a linked card nests links and Framer flags the publish. Make the card not a link; link its parts.
- Fill height is refused for cards inside a paginated list, and fill height inside a content-sized card collapsed a grid to 2 px; keep heights auto and use a title min-height.
- The grid attribute is `gridColumnCount`; a column gap is written `gap="0px 48px"`.
- Fixed elements inside a grid list render before the repeated cards; put a header in its own one-item list.
- A repeated CMS-list item with auto width keeps the editor's placeholder width; use a self-sizing chip component.
- Sections bound to `visible` on a CMS field hide themselves when the field is empty, which makes a partly filled template safe to publish.
- Hover variants on a shared component make phone taps jump to desktop sizes (handlers cannot differ per variant); use variables and `SET_VARIABLE_VALUE` instead. Phones have no hover.
- Framer's default 0.4 s spring with bounce makes taps feel slow; use `tween 0,0,0.58,1 0.15s 0s`.
- Once any state of a component changes its tag away from `button`, that component can never again be a form's submit button.
- A submit button whose "sent" state becomes a download link is rejected; the after-submit redirect is editor-only.
- Framer's default Load More is a small grey English button; convert it to a local component to restyle it.
- A custom cursor set inside a component is saved but left out of the published site; cursors must start from the page.
- Scroll-trigger effects are visible only in Preview or on the published site, not in canvas screenshots.
- Invisible "Navigation Trigger" and "Next Page Trigger" frames are scroll markers for the header; never delete them. Header scroll triggers can only be set in the editor, and the picker only lists sections with a scroll id.
- A new "Alt" control on existing instances is ignored by Framer; alt for CMS images lives in the image value.
- Hidden template components still ship their code and links to the live site.
- Framer does not lock the root font size: rem text follows the visitor's text size, and fixed-height sliders do not grow with it.
- FAQ answers removed in the closed variant are absent from the HTML; keep the answer layer at height 0 with clip.
- The editor preview does not run site custom code; a text style created in the same session screenshots blank; draft pages cannot be screenshotted.

## Performance

- The CDN re-encodes scaled image variants itself, so recompressing uploaded photos saves almost nothing; mobile LCP is held by Framer's hydration, not file sizes.
- Framer requests image sizes from the layer width (a 720 px layer pulls 1024 px files on phone); the resolution setting is global.
- Lighthouse ignores video downloads; run-to-run noise is large. Measure twice before claiming a gain.
- Bandwidth is a running total for the billing period; automated live testing counts against it. Routine checks go to previews.
- The plugin API cannot see custom fonts; a stale `@font-face` record is a Framer-side issue.

## Site scripts and custom code

- Framer's inline page script delays every `document` listener for click, mousedown, keyup, submit and auxclick; site scripts must listen on `window` in the capture phase.
- Arabic validation messages ending in "." need an RLM or LRM at the end.
- Framer never clears form fields after success, and the footer form persists across pages.
- The installed custom-code version only goes live with the next publish; the production copy can lag the slot.

## Uploads and files

- `framer.uploadFile` rejects a sandbox `Uint8Array` (wrong realm) and fails on data URLs of a few megabytes; very large files are uploaded by the owner in the CMS, and his upload may sit on an unmerged editor branch.
- `framer.uploadImage({ altText })` does not carry the alt into a CMS value.

## Live checks

- The CDN sometimes serves a short placeholder shell with the Home title; fetch slowly and re-fetch until the full page comes back.
- Framer renders every breakpoint copy whose text differs and hides it with CSS, so SEO tools count duplicate headings.
- `/en` redirects to `/en/`; external links should use `/en/`.
- Template pages that were never removed stay in the sitemap until no-indexed or deleted.

## Working with the owner

- The owner publishes between steps if told "safe" too early; make multi-step changes atomic or warn him.
- Changing Arabic in a component's variant updates every page at once; state what visitors will see change.
- Never trade perceived speed for cleanliness (a toggle that waited for its page download was reverted).
- Sample statistics on a page are not facts until the owner verifies them; never present them as results.
