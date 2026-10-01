# envcontract

> Find environment-variable drift before your users do.

[![npm](https://img.shields.io/npm/v/envcontract)](https://www.npmjs.com/package/envcontract)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![GitHub stars](https://img.shields.io/github/stars/tangyuan1129/envcontract)](https://github.com/tangyuan1129/envcontract/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/tangyuan1129/envcontract/ci.yml?label=CI)](https://github.com/tangyuan1129/envcontract/actions)

Your code, `.env.example`, README, Dockerfile and CI can quietly disagree. `envcontract` reads the repository locally and tells you what a fresh clone will miss. It never uploads files and never prints secret values.

- **Zero runtime dependencies.** A tool that runs in CI on every push should not drag its own supply chain along. This one has none.
- **Local only, always.** No network calls, no account, no telemetry — and it never prints a secret value.
- **`--strict` fails your build. `--json` feeds your dashboard.**

## Try it

```bash
npx envcontract .
```

Run it before every push, and a missing variable on the day of the deploy stops being a surprise.

## CI in one line

```yaml
- run: npx envcontract . --strict
```

Use `--json` for bots and dashboards. The scanner understands JavaScript/TypeScript, Python, Go, Ruby, PHP, Java, Rust, Swift, shell, Docker/Compose, and `${VARIABLE}` references. It ignores `.git`, dependencies and build output.

### As a GitHub Action

```yaml
- uses: tangyuan1129/envcontract@v1
  with:
    path: .
    strict: true
```

Findings show up as native annotations on the job, and `errors` / `warnings` are exposed as step outputs. Set `strict: false` to report without failing the build.

## What it checks

- Variables referenced in code but missing from `.env.example` (and vice versa)
- Variables your README or Dockerfile promises but nothing provides
- Mismatches between `.env.example` and the environment your CI actually builds

Anything that would make a fresh clone fail to start, `envcontract` catches locally — before your users do.

## Why this exists

Linters usually check source code. Dotenv tools usually check one env file. `envcontract` checks the *contract between them* — the tiny promise that makes a fresh clone start.

It is deliberately small: zero runtime dependencies, no network access, and a codebase you can read in one sitting. Nothing here should be the reason your CI breaks.

## Development

```bash
npm test
node bin/envcontract.js . --strict
```

Node 18+.

## Publish your own copy

The repo ships with an MIT License, CI, issue templates and an npm publishing workflow. To release the first version, follow the 3 steps in [`RELEASE.md`](RELEASE.md).

## License

MIT © envcontract contributors