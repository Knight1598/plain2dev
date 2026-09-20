# Security

## Reporting a vulnerability

Report privately through [GitHub's security advisory form](https://github.com/Knight1598/plain2dev/security/advisories/new), or open an issue with no exploit detail and ask for a private channel. Please do not post a working exploit in a public issue.

Expect an acknowledgement within seven days. There is no bounty programme.

## What is in scope

The installer writes files into a project directory you name, so its path handling is the part most worth attacking. It is designed to refuse:

- absolute paths, `..` segments, empty segments, backslashes and drive-letter prefixes in any managed path,
- symbolic links anywhere along a destination path, including the target directory itself, re-checked immediately before each write,
- a tampered `.plain2dev/install.json` pointing outside the installed adapters' folders,
- overwriting any file it does not have a recorded hash for.

Each of those has a test in `tests/install.test.mjs`. A way past any of them is in scope.

## What is out of scope

- **Model behavior.** Plain2Dev is instruction text. It steers an AI; it cannot constrain one. An agent ignoring the skill, leaking context, or acting outside its authorization is a property of the agent and its permissions, not of this package.
- **What you put in memory.** `.plain2dev/` is plain files in your repository, committed if you commit them. The skill instructs the model not to write secrets or personal customer data there, but nothing enforces it. Review those files as you would any other tracked file, and do not store credentials in them.
- **Content you install.** A skill file is instructions to a model. Install only from a source you trust, and read the diff on upgrade — `--check` verifies hashes against the manifest, which tells you a file is unmodified, not that its content is safe.

## Supply chain

The package has no runtime dependencies. The installer uses only Node's standard library. Release archives are published with a SHA-256 digest; verify it before extracting a download.
