# Arabic on the AZM X website

## Copy

- Write native Modern Standard Arabic. Carry the full meaning and tone of the English slot; a heading that is a sentence in English is a sentence in Arabic, not a two-word label.
- Use «المنصة» for the platform. Never «البوابة».
- Never mix Arabic and English in one sentence. A technical term may stand at the start or the end of an Arabic sentence; a Latin product name inside an Arabic sentence needs a right-to-left mark (RLM, U+200F) before it so the punctuation stays in place.
- Use Arabic punctuation and the Arabic comma «،». Use «» for quotes.
- Numbers: Western Arabic digits (0–9) as the site uses them; keep whatever the page already does.
- Read the English first, then write the Arabic from the meaning, not word by word. Then read the Arabic alone: if it reads as translated English, rewrite it.

## Layout

- The canvas and the live site are right to left for Arabic. English pages mirror: side-by-side items in reverse order, vertical stacks aligned to the end, text aligned left.
- Latin-first text in an Arabic field (a brand name, an acronym) needs the RLM before it or the trailing punctuation jumps.
- Fonts: the site's Arabic and Latin families are set in the design system; never substitute a system font to "fix" a glyph.

## Code and CSS

- Tell the languages apart by `html[dir="rtl"]`, not by `lang`. The English blog page declares `lang="ar"`, so a `lang` selector misfires.
- Localization through the Framer agent: an `action: "ignore"` empties the English value; it does not mean "keep and mark reviewed". Re-setting an unchanged value does not clear a "needs review" flag. Leave the flag or set a changed value.

## Checking

- Both languages, every breakpoint, every change.
- A phone screenshot of the Arabic page is the first check: it shows alignment and wrapping problems that desktop hides.
