# Thunderbolt Fighter

[English](README.md)

Thunderbolt Fighter 是一款离线桌面街机射击游戏，使用 Electron 和 Phaser 构建。玩家可以选择战斗时长和难度，躲避敌机火力，收集强化道具，刷新本地最佳分数，并在战斗结束前击败 Boss。

## 前置条件

从源码运行或构建游戏前，需要先安装带有 npm 的 Node.js。发布流程使用 Node.js 22，因此本地打包时建议使用相同版本。

## 安装

```sh
npm install
```

## 运行

```sh
npm run dev
```

## 构建 Windows 应用

```sh
npm run package:win
```

打包后的可执行文件会写入 `release/Thunderbolt Fighter-win32-x64/Thunderbolt Fighter.exe`。

## 下载预构建版本

不想安装 Node.js 的玩家可以从项目 GitHub Releases 页面下载预构建 Windows 压缩包 `thunderbolt-fighter-win32-x64.zip`：https://github.com/Authorm-lh/Thunderbolt-Fighter/releases
