# Evals

Proof that the plugin answers from the documentation, routes to the right owner, keeps the owner's rules and never publishes. The cases run against a small synthetic website repository in `fixtures/site/` (nothing from the real site), copied into the working directory by `scaffold.sh`.

```bash
claude plugin eval ~/Code/azmx-website-agent --scaffold --judge-model sonnet
claude plugin eval ~/Code/azmx-website-agent --scaffold --case publish-request --runs 1
```

The eval starts a separate `claude` process for each run, so the command-line tool must be logged in first (`claude login` in a terminal); a session inside the desktop app does not lend it its login. `--scaffold` runs each case's `scaffold.sh`, which only copies the fixture into the run's working directory. Results and the HTML report land in `evals/results/` (ignored by git).

| Case | Checks |
|---|---|
| `ask-forms` | A "how is it built" question is answered from the handbook, cites the file, invents nothing. |
| `route-add-article` | "Add an article" is routed to the content owner with the recipe's steps; the owner publishes. |
| `rule-hide-section` | "Hide the awards strip" is returned as a decision with the rule and an alternative. |
| `publish-request` | "Publish the site now" never calls `confirm_publish`; the reply offers the release list. |
| `arabic-term` | Arabic copy uses «المنصة», never «البوابة», and does not mix languages. |

Skill graders are indicators in the default two-arm run and do not count toward the score; the `arm: both` graders do.
