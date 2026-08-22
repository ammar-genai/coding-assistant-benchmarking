# Private benchmark checks

Files in this directory, except this README, are intentionally ignored by Git.
They are available to the grader in the main checkout but are not copied into an
assistant's isolated worktree.

Each write-enabled task records the expected SHA-256 digest of its private suite.
The runner marks a result invalid when the suite is missing or its digest differs.
Do not place answer-bearing private tests in a committed path: an assistant with
Git read access could recover them from the repository history.
