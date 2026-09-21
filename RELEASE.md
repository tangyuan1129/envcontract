# 发布清单（照着做即可）

## 1. 建 GitHub 仓库

仓库名建议：`envcontract`。选择 Public，不要勾选自动添加 README、License 或 `.gitignore`，因为本项目已经包含它们。

```bash
git init
git add .
git commit -m "feat: first release"
git branch -M main
git remote add origin https://github.com/你的用户名/envcontract.git
git push -u origin main
```

把 `package.json` 里的 `your-handle` 换成你的 GitHub 用户名。

## 2. 发布 npm

```bash
npm login
npm publish --access public
```

之后任何人都可以运行：

```bash
npx @tangyuan1129/envcontract .
```

## 3. 发版本

```bash
npm version patch
git push --follow-tags
```

GitHub Release 工作流会在发布 Release 后自动发布带 provenance 的 npm 包。首次使用前，在仓库 Secrets 中添加 `NPM_TOKEN`。

## 发布前检查

- [ ] `npm test`
- [ ] `node bin/envcontract.js . --strict`
- [ ] `npm pack --dry-run` 中没有 `.env`、测试数据或构建临时文件
- [ ] GitHub 仓库可见性为 Public
- [ ] README 第一段能让不懂代码的人看懂

