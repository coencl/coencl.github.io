# 🌐 DNS 记录配置指南

## 📋 当前 DNS 记录状态

根据你的 Cloudflare DNS 页面显示，目前有以下记录：

### 现有记录
- `_dnsauth` 记录 - Cloudflare 域名验证记录（这是正常的，不要删除）
- 其他记录（具体内容需要确认）

## 🔧 需要添加的 DNS 记录

### 主要记录配置

#### 1. 根域名记录
```
类型: CNAME
名称: @
目标: coencl-github-io.pages.dev
代理状态: 已代理 (橙色云朵)
TTL: Auto
```

#### 2. www 子域名记录
```
类型: CNAME
名称: www
目标: coencl-github-io.pages.dev
代理状态: 已代理 (橙色云朵)
TTL: Auto
```

## 📝 配置步骤

### 步骤 1：删除不需要的记录
1. 在 Cloudflare DNS 页面
2. 删除任何指向其他地址的 A 记录或 CNAME 记录
3. **保留 `_dnsauth` 记录**（这是 Cloudflare 验证记录，不要删除）

### 步骤 2：添加新的 CNAME 记录
1. 点击 **Add record**
2. 选择 **CNAME**
3. 配置如下：

**记录 1：根域名**
- Type: `CNAME`
- Name: `@`
- Target: `coencl-github-io.pages.dev`
- Proxy status: **已代理** (橙色云朵)
- TTL: `Auto`

**记录 2：www 子域名**
- Type: `CNAME`
- Name: `www`
- Target: `coencl-github-io.pages.dev`
- Proxy status: **已代理** (橙色云朵)
- TTL: `Auto`

### 步骤 3：验证配置
配置完成后，你的 DNS 记录应该类似这样：

```
类型    名称    内容                          代理状态    TTL
CNAME   @      coencl-github-io.pages.dev   已代理     Auto
CNAME   www    coencl-github-io.pages.dev   已代理     Auto
TXT     _dnsauth  [验证字符串]                DNS only   Auto
```

## ⚠️ 重要注意事项

### 1. 代理状态设置
- **已代理** (橙色云朵) - 启用 Cloudflare 加速和安全功能
- **DNS only** (灰色云朵) - 仅 DNS 解析，不经过 Cloudflare

### 2. 不要删除的记录
- `_dnsauth` 记录 - 这是 Cloudflare 的域名验证记录
- 任何其他 Cloudflare 自动创建的记录

### 3. 删除不需要的记录
- 任何指向其他 IP 地址的 A 记录
- 任何指向其他域名的 CNAME 记录（除了我们需要的）

## 🔍 验证配置

### 1. DNS 传播检查
使用以下工具检查 DNS 传播：
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://whatsmydns.net/)

### 2. 本地测试
```bash
# Windows
nslookup zeroisall.fun
nslookup www.zeroisall.fun

# 或使用 PowerShell
Resolve-DnsName zeroisall.fun
Resolve-DnsName www.zeroisall.fun
```

### 3. 网站访问测试
- `https://zeroisall.fun` - 主域名
- `https://www.zeroisall.fun` - www 子域名

## 🚨 常见问题

### DNS 记录不生效
1. 等待 DNS 传播（最多 24 小时）
2. 清除本地 DNS 缓存
3. 检查记录配置是否正确

### 网站无法访问
1. 确认 CNAME 记录指向正确的 Pages 域名
2. 检查代理状态是否为"已代理"
3. 确认 Cloudflare Pages 项目已部署

### SSL 证书问题
1. 确保 DNS 记录正确
2. 等待 SSL 证书自动签发（最多 24 小时）
3. 检查域名是否被代理（橙色云朵）

## 📞 需要帮助？

如果配置过程中遇到问题，请提供：
1. 当前 DNS 记录的完整截图
2. 具体的错误信息
3. 使用的配置方法（Cloudflare DNS 还是阿里云 DNS）
