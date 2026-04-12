# 🔄 更新 Cloudflare Pages GitHub 仓库连接指南

## 📋 背景

GitHub 用户名已更新为 `coencl`，需要在 Cloudflare Pages 中重新连接 GitHub 仓库。

## 🔧 操作步骤

### 1. 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 使用你的账号登录

### 2. 进入 Pages 项目设置

1. 点击左侧菜单的 **Pages**
2. 找到你的项目：`coencl-github-io`（或你的实际项目名称）
3. 点击项目名称进入项目详情页

### 3. 重新连接 GitHub 仓库

1. 点击 **Settings** 标签页
2. 找到 **Builds & deployments** 部分
3. 找到 **Source** 部分，点击 **Connect to Git**
4. 如果已经连接，点击 **Disconnect** 断开旧连接
5. 重新点击 **Connect to Git**
6. 授权 Cloudflare 访问你的 GitHub 账户（如果还没授权）
7. 选择新的仓库：`coencl/coencl.github.io`
8. 点击 **Begin setup** 或 **Save**

### 4. 验证配置

1. 确认 **Production branch** 设置为 `main`
2. 确认 **Build command** 为：`bundle exec jekyll build`
3. 确认 **Build output directory** 为：`_site`
4. 确认 **Root directory** 为：`/`（根目录）

### 5. 触发部署

1. 保存设置后，Cloudflare 会自动触发一次构建
2. 或者，你可以手动点击 **Retry deployment** 来触发新的构建
3. 等待构建完成（通常需要 2-5 分钟）

## ✅ 验证部署

1. 检查构建日志，确保构建成功
2. 访问你的网站：`https://zeroisall.fun` 或 `https://coencl-github-io.pages.dev`
3. 确认网站正常显示

## 🔍 GitHub Actions 配置说明

当前 GitHub Actions 配置文件（`.github/workflows/cloudflare-pages.yml`）中的 `projectName` 必须与 Cloudflare Pages 中的实际项目名称匹配。

**当前配置：**
```yaml
projectName: coencl-github-io
```

**如果 Cloudflare 项目名称保持不变：**
- ✅ 不需要修改 GitHub Actions 配置
- ✅ 只需要在 Cloudflare Dashboard 中重新连接仓库即可

**如果你想重命名 Cloudflare 项目：**
1. 在 Cloudflare Dashboard 中重命名项目
2. 更新 `.github/workflows/cloudflare-pages.yml` 中的 `projectName`
3. 提交并推送更改

## 🚨 常见问题

### Q: 重新连接后构建失败怎么办？

**A:** 检查以下几点：
1. 确认 GitHub 仓库地址正确：`coencl/coencl.github.io`
2. 确认 Cloudflare 有权限访问该仓库
3. 检查构建日志中的错误信息
4. 确认 `Gemfile` 和 `_config.yml` 配置正确

### Q: 项目名称需要更改吗？

**A:** 不需要。Cloudflare Pages 项目名称可以独立于 GitHub 用户名，只要在 Dashboard 中重新连接正确的仓库即可。

### Q: GitHub Actions 部署失败怎么办？

**A:** 检查以下几点：
1. 确认 GitHub Secrets 中的 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 仍然有效
2. 确认 `projectName` 与 Cloudflare 中的项目名称匹配
3. 检查 GitHub Actions 日志中的错误信息

## 📝 注意事项

- ⚠️ 重新连接仓库后，之前的部署历史会保留
- ⚠️ 自定义域名配置（`zeroisall.fun`）不会受到影响
- ⚠️ DNS 记录配置不需要修改
- ✅ 重新连接后，每次推送到 `main` 分支都会自动触发部署

## 🎉 完成

完成以上步骤后，你的 Cloudflare Pages 就会连接到新的 GitHub 仓库，并自动部署你的博客更新。

