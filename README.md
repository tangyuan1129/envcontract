# envcontract

**Find environment-variable drift before your users do.**

Your code, `.env.example`, README, Docker file and CI can quietly disagree. `envcontract` reads the repository locally and tells you what a fresh clone will miss. It never uploads files and never prints secret values.

## Try it

```bash
npx envcontract .
```

## CI in one line

```yaml
- run: npx envcontract . --strict
```

Use `--json` for bots and dashboards. The scanner understands JavaScript/TypeScript, Python, Go, Ruby, PHP, Java, Rust, Swift, shell, Docker/Compose, and `${VARIABLE}` references. It ignores `.git`, dependencies and build output.

## Why this exists

Linters usually check source code. Dotenv tools usually check one env file. `envcontract` checks the *contract between them*—the tiny promise that makes a fresh clone start.

## Development

```bash
npm test
node bin/envcontract.js . --strict
```

No runtime dependencies. Node 18+.

## Publish your own copy

仓库已经带好 MIT License、CI、Issue 模板和 npm 发布工作流。第一次发布只需按 [`RELEASE.md`](RELEASE.md) 的 3 步操作。

## License

MIT © envcontract contributors

