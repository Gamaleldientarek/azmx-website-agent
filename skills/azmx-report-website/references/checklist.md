# Report checklist: before showing Jimmy, before the merge

Run every line on the branch preview. Measure in the browser (`getBoundingClientRect`, computed styles) rather than trusting a screenshot from a hidden pane; animations look faded there.

## Layout, both languages, 1440 and 375 (and 810 by eye)

- [ ] One H1 (the report's title); one H2 per chapter; labels and eyebrows are `p`.
- [ ] No sideways scroll; no text wider than its box.
- [ ] Every Arabic text, eyebrow, fact value and table cell sits on the right edge of its box (0 px gap); every English one on the left. Watch the texts with no Arabic letter: numbers («01», «32%», «2.16»), stars, ranges, Latin names. They need a right-to-left mark in front (found live on 18 Nov on both first reports).
- [ ] Fact values regular weight; facts are compact rows on the phone.
- [ ] Chapter index visible on desktop only, with no active overlay; Reading Progress at the top.
- [ ] ✓/✕ marks centred (0 px from the circle's centre).
- [ ] Counters, bars and tiles appear after scrolling (check on the phone width too).
- [ ] Cards hover at 2 %, no lift; text links fade to 60 %.
- [ ] K3 cards stack in one column on the phone; T1 stacks words over buttons; buttons use Mobile variants.

## Links

- [ ] «ابدأ القراءة» goes to the first chapter; every index item to an existing chapter id.
- [ ] Download buttons go to `/reports/<slug>` (and `/en/…`).
- [ ] In-text links, K3 cards and T1 buttons open live pages, `/en/…` on English.
- [ ] The download page shows the "Read online" link (Read Online field filled).

## SEO (with the SEO engine's `page_fetch`, after the preview's pre-render finishes)

- [ ] Title and description are the page's own in both languages (not the site default «متخصصون في تجربة المستخدم…»).
- [ ] Canonical `https://azmx.sa/reports/<slug>/read` and three hreflang links (ar, en, x-default).
- [ ] The keyword in the title, description and first paragraph; the download page title ends «تنزيل التقرير بصيغة PDF».
- [ ] No `noIndexSite` in the page metadata.
- [ ] No console errors.

## Hand-over

Send Jimmy, in short:
- the preview links (reading page ar/en, download page ar/en);
- the wording differences from the PDF, numbered, for his word;
- new copy that is yours (end-section lines, meta) for his read;
- what you didn't check;
- then wait: he merges and publishes. Record the build in `review.md` and the open items in `task.md`. Add any new decision to the decisions file of the website repository's report skill (see SKILL.md › Load first).
