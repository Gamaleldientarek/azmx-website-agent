# Example site handbook

## Contents
1. Site map · 2. Page by page · 3. CMS · 4. Forms · 5. How-to recipes · 6. Known issues

## 1. Site map
Home `/`, Services `/services`, About `/about`, Articles `/blog` and `/blog/:slug`, Contact `/contact`, Glossary `/glossary`. English copies under `/en`.

## 2. Page by page
### Home `/`
Sections in order: Hero (video), Services carousel (CMS: Services, 10 items), Why us bento, Testimonials slider (CMS: Testimonials & Awards, Type = Testimonial), Articles (CMS: Blog, 3 newest), Newsletter, CTA bar.
### About `/about`
Dark hero, Vision and Mission, Values, Team (CMS: People), Accreditations, Ecosystem logo strip, Awards strip (CMS: Testimonials & Awards, Type = Award).

## 3. CMS
Collections: Blog (11), Services (10), People (9), Careers (5), Testimonials & Awards (5), Glossary (1,080). Every list's filter and sort is in the site map.

## 4. Forms
The newsletter form on every page and the contact forms post through a Cloudflare Worker relay (`code/brevo-relay`) to Brevo. The Worker checks the origin, adds the contact to list 3 and sends the confirmation email. Validation messages are set by the site script `data-azmx="form-messages"` in the body-end custom code slot.

## 5. How-to recipes
### Add an article
1. Blog collection › New item. Fill Title AR, Title EN, Slug, Date, Cover, Body AR, Body EN, Category.
2. Leave it as a draft until the cover is in place. 3. Publish (the owner).
### Add a job
Careers collection › New item: Title AR/EN, Location, Type, Description, Apply link.

## 6. Known issues
- The screenshot tool caches an address; add `&cb=1`.
