# 上传 GitHub 与部署教程

这份是 v2 完整源码，包含订单、仓库、定向跑轮灌溉和 GitHub Pages 部署文件。游戏无需安装依赖或购买 IMD。

## 1. 上传源码

1. 用自己的 GitHub 账号创建仓库，名称可用 `squeek-grove`。准备交给项目方审核时，源码需要公开可读。
2. 解压 `squeek-grove-source-v2.zip`，将里面的文件、文件夹上传到仓库根目录。**别只上传 ZIP，也别多套一层文件夹。**
3. 仓库首页应直接看到 `README.md`、`package.json`、`dist/`、`tests/`、`docs/`、`.github/`。提交到 `main` 分支。
4. `.github` 可能被系统隐藏。确认 `.github/workflows/pages.yml` 已上传；若缺少，可在 GitHub 的 Add file → Create new file 中填写这个完整路径，再粘贴源码包内同名文件的内容。

游戏不需要钱包私钥、助记词或账号令牌；不要把这些信息放进仓库。

## 2. 让游戏上线

1. 仓库 → **Settings → Pages**。
2. **Build and deployment → Source** 选 **GitHub Actions**。
3. 仓库 → **Actions** → **Deploy Squeek Grove to GitHub Pages** → **Run workflow**，选择 `main` 并运行。
4. 成功后打开部署结果中的网站地址。GitHub 源码页面和游戏网站是两个不同的链接。
5. 以后向 `main` 提交修改会自动更新网站。发布内容是 `dist/`，无需构建。

如果你的分支名不是 `main`，修改 `.github/workflows/pages.yml` 中的分支名。若提示 Pages 没启用，先完成 Settings → Pages 配置，再重新运行。

参考：[GitHub Pages 官方工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 3. 检查与迁移存档

用电脑和手机打开网站，检查种植、灌溉、收获入仓、出售、接单和交付。普通订单不需要跑轮能量，跑轮专送需要指定品质的作物。

先在旧预览站“存档与设置”导出 JSON，再到新站导入。不同域名不会自动共用存档。

用无痕窗口检查游戏能否直接访问、源码仓库是否公开可读。

## 4. 提交 Squeekchain

GitHub Pages 默认地址可以先试玩，但不代表已通过 Squeekchain 的域名所有权验证。按官方表单允许的域名与验证要求准备；若要求自有域名，需要将自己的域名绑定到托管网站。

打开 [Genesis Code](https://squeekchain.com/genesis/code)，选择“提交项目 → 直接提交”。本项目没有 IMD 任务编号，不填 IMD 入口。

项目简介、演示顺序在 [SUBMISSION.md](SUBMISSION.md)。若官方流程生成 DNS TXT、网页验证标签、README 验证行，请原样添加。网页标签放到 `dist/index.html` 的 `<head>` 中，README 验证行放到仓库根目录的 `README.md`。重新部署后验证。

源码上传和网站上线不等于审核通过。这份交付没有替你提交项目或完成官方验证。
