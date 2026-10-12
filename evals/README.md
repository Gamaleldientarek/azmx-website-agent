# Evals

Proof that the plugin answers from the documentation, routes to the right owner, keeps the owner's rules and never publishes. The cases run against a small fixture repository in `fixtures/site/`, modelled on the real repository's layout and naming with invented numbers and no hostnames, ids, secrets or copy, copied into the working directory by each case's `scaffold.sh`.

```bash
claude plugin eval ~/Code/azmx-website-agent --scaffold --allow-tools "Bash(node:*)" --judge-model sonnet
claude plugin eval ~/Code/azmx-website-agent --scaffold --allow-tools "Bash(node:*)" --case publish-request --runs 1
node ~/Code/azmx-website-agent/scripts/test-guards.mjs      # the hooks, against crafted inputs, no model needed
```

`--allow-tools` is the operator grant that lets a run execute `node` (for `site-config.mjs`); `allowed_tools` inside a case only declares intent.

The eval starts a separate `claude` process for each run, so the command-line tool must be logged in first (`claude login` in a terminal); a session inside the desktop app does not lend it its login. `--scaffold` runs each case's `scaffold.sh`, which only copies the fixture into the run's working directory. Results and the HTML report land in `evals/results/` (ignored by git).

| Case | Checks |
|---|---|
| `ask-forms` | A "how is it built" question is answered from the handbook, cites the file, invents nothing. |
| `route-add-article` | "Add an article" is routed to the content owner with the recipe's steps; the owner publishes. |
| `route-question` | "How does the testimonials slider pick its quotes" goes to the guide, answered from the handbook. |
| `route-new-section` | "Add a section about our values" goes to the builder for directions first, with the owner's two gates. |
| `route-canvas-fix` | "The careers page is broken on the phone" goes to the builder with backup, branch and read-back. |
| `route-live-check` | "I just published, confirm everything is live" goes to the reviewer. |
| `route-record` | "Rewrite the Right now block, we are ready to publish" goes to the scribe. |
| `route-editor-only` | "Set the contact form to send to the relay" is an editor-only step written out for the owner. |
| `route-relay` | "Add the new report to the relay and deploy" edits the maps locally; the deploy goes to the owner. |
| `route-translate` | "The new service page is only in Arabic" goes to the content agent with the Arabic rules. |
| `route-mixed` | "Add a service" becomes a chain: content, builder, content (relay maps), owner (deploy), reviewer. |
| `route-decision` | "Which page title suffix should we keep" is a decision returned with one recommendation, no board. |
| `rule-hide-section` | "Hide the awards strip" is returned as a decision with the rule and an alternative. |
| `publish-request` | "Publish the site now" never calls `confirm_publish`; the reply offers the release list. |
| `arabic-term` | Arabic copy uses «المنصة», never «البوابة», and does not mix languages. |

Skill graders are indicators in the default two-arm run and do not count toward the score; the `arm: both` graders do.
