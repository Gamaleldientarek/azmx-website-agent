---
name: azmx-site-rules
description: This skill should be used whenever work touches the AZM X website: editing a page, section, component or style in Framer, writing or translating Arabic or English copy, adding or changing CMS content, proposing a new section or design direction, moving or resizing an element, or when someone asks to hide, remove, replace or publish anything. It holds the owner's standing rules, which outrank any default behaviour, and the Arabic writing rules. Load it before the first change and check the work against it before reporting done.
version: 0.1.0
---

# AZM X website: standing rules

These rules come from the site's owner and were set during the build. They outrank defaults, templates and taste. When a request conflicts with one, state the conflict in a sentence, do everything that does not conflict, and return the decision to the owner. Never resolve it silently either way.

## 1. Publishing and the record

- **Publishing is the owner's.** Prepare, merge to main, verify, record. Never publish the live site. (A hook enforces this; the rule exists so the plan never includes it.)
- **Back up before writing.** Serialize the nodes that will change to the backups folder as JSON before the first write. Name the file after the change and the date.
- **Finished work goes on main.** Write on a branch, read it back there, merge to main, confirm the branch is gone, re-read on main.
- **Proof-of-concept branches are the exception:** build and preview only; the owner merges those himself.
- **Re-read live state before editing.** The owner edits in Framer directly. Keep his wording and layout changes. Never revert them to an older version without his direct yes.
- **Record everything** in the review log (what, why, evidence) and the task list (status). "Done" means merged to main and recorded; "live" means confirmed on the live site after his publish.

## 2. What stays

- **Template sections and assets stay.** Never hide, remove or replace a section, a video, an image or an asset without a yes. Translate them, fill them, and list any missing facts for the owner.
- **Video stays.** Never hide or swap a video tile.
- **Dark heroes stay** on About, Services and Careers.
- **Nothing is deleted** from the CMS without a yes. Draft it instead, and say so.

## 3. How things look

- **Native Framer first.** The owner dislikes code overrides. Before writing any code, explain what native Framer cannot do; build with native features whenever they can do it.
- **Never stretch an image or a logo.** Cover or fit with the real ratio. Never use page-wide zoom scaling to make a layout fit.
- **Moving an element keeps every size and space.** When asked to move something, change position only. Show options as screenshots of the live page, without highlight boxes.
- **New sections start with references.** Show two or three directions with references (Craftwork, Mobbin) and build only after the owner picks one.
- **Testimonials:** the arrows stay at the top, level with the heading. No arrows-and-dots row under the cards.
- **Breakpoints:** a change is done when it holds on desktop, small desktop, tablet and phone. Copies of nodes lose phone overrides; reapply them.

## 4. Words

- **The positioning line is fixed.** Arabic: «شركة سعودية رائدة في الاستشارات الرقمية». English: "a leading Saudi digital consultancy". Never "studio", "agency" or "boutique", in either language.
- **Arabic is the default language** at `/`, right to left; English is at `/en`. Every change exists in both.
- **Arabic rules** are in `references/arabic.md`. The three that matter most: native Modern Standard Arabic that carries the full meaning and tone of the English, never a terse label; «المنصة», never «البوابة»; never Arabic and English in one sentence.

## 5. When a request conflicts

Say which rule, in one sentence. Do the part that does not conflict. Return the rest as a decision, with a recommendation. Example: "Hiding the awards strip conflicts with 'template sections stay'. I translated it and listed the two missing award names; hiding it is your call. My recommendation: keep it until the names arrive."

## Additional resources

- **`references/arabic.md`**: writing and laying out Arabic on this site (copy, RTL, CSS selectors, mixed text).
- **`references/decisions.md`**: decisions the owner has already made, so they are not reopened.
