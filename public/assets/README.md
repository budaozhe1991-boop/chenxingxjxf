# 游戏资源替换指南

你可以在这个目录下替换游戏的图片资源。请确保文件名与下面列出的完全一致，并使用 PNG 格式。

## 重要提示 (Important)
**注意：** 仓库中默认的图片文件是空文件（0字节），浏览器无法显示。
**你必须在本地电脑上用真实的 PNG 图片替换 `public/assets/` 目录下的同名文件，然后重新上传到 GitHub。**

## 战机 (Player Ships)
- `player_balanced.png`: 均衡型战机
- `player_speed.png`: 极速型战机
- `player_power.png`: 火力型战机
- `player_defense.png`: 防御型战机

## 敌机 (Enemies)
- `enemy_basic.png`: 基础敌机
- `enemy_fast.png`: 快速敌机
- `enemy_heavy.png`: 重型敌机
- `boss.png`: BOSS 战机

## 建议尺寸
- 战机: 80x80 像素 (透明背景)
- 敌机: 40x40 到 120x120 像素不等
- BOSS: 300x240 像素

## 如何在本地运行
1. 安装 Node.js
2. 在项目根目录运行 `npm install`
3. 运行 `npm run dev` 启动本地开发服务器
