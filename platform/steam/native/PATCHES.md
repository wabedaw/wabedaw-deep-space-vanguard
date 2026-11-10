# steamworks.js（自带修改版）

`steamworks.js/` 是 [ceifa/steamworks.js](https://github.com/ceifa/steamworks.js)（MIT 许可，见其中的 `LICENSE`）的源码副本，加了排行榜接口。游戏的 Steam 桌面版通过 `platform/steam/package.json` 里的 `"steamworks.js": "file:native/steamworks.js"` 使用它。

## 来源

| 项目 | 值 |
|---|---|
| 上游提交 | `80c5fd7c49`（2025-09-07 的 main：0.4.0 + `achievement.names()` + `cloud.setEnabledForApp()`） |
| 底层 Rust 库 | steamworks-rs `fbb79635`（上游锁定的版本，已带排行榜函数） |
| 复制日期 | 2026-11-10 |

## 改了什么

只加不改，上游的接口全部保持原样：

- 新增 `src/api/leaderboard.rs`，在 `src/api/mod.rs` 里登记。
- `client.d.ts` 由构建重新生成，多了 `leaderboard` 命名空间。
- `.gitignore` 不再忽略 `dist/`：预编译的二进制文件进 Git，打包游戏不需要装 Rust。
- 新增 `check-binaries.mjs`：报告 `dist/` 里每个平台的二进制有没有这个补丁。

```ts
leaderboard.find(name): Promise<boolean>
leaderboard.findOrCreate(name, SortMethod, DisplayType): Promise<boolean>
leaderboard.uploadScore(name, score, UploadScoreMethod, details?: number[] /* 最多 64 个 */): Promise<UploadScoreResult | null>
leaderboard.downloadScores(name, DataRequest, start, end): Promise<LeaderboardEntry[]>   // 条目含名次、分数、SteamID、昵称、details
leaderboard.getEntryCount(name): number | null
```

排行榜用名字指定。steamworks-rs 不能从数字 ID 重建榜单句柄，所以找到过的榜单按名字缓存在进程里。

## 各平台二进制的状态

运行 `node platform/steam/native/steamworks.js/check-binaries.mjs` 查看。2026-11-10：

| 平台 | 状态 |
|---|---|
| macOS arm64 / x64 | 已打补丁，在本机编译 |
| **Windows x64** | **仍是上游 0.4.0 的二进制，没有排行榜**：要跑一次 CI |
| Linux x64 | 仍是上游 0.4.0 的二进制 |

游戏在运行时检查有没有 `leaderboard` 接口：没有时 Steam 版排行榜显示本机成绩，其余 Steam 功能照常。

## 重新编译

**Windows 和 Linux（CI）：** GitHub → Actions → "steamworks native" → Run workflow（`.github/workflows/steamworks-native.yml`，改了 Rust 源码推送时也会自动跑）。完成后：

```bash
gh run download --repo wabedaw/wabedaw-deep-space-vanguard --name win64 --dir platform/steam/native/steamworks.js/dist/win64
gh run download --repo wabedaw/wabedaw-deep-space-vanguard --name linux64 --dir platform/steam/native/steamworks.js/dist/linux64
node platform/steam/native/steamworks.js/check-binaries.mjs --require win64,linux64,osx
```

然后提交 `dist/` 的变化，并重新 `npm run steam:install`。

**macOS（本机）：** 需要 Rust（`rustup`）。

```bash
cd platform/steam/native/steamworks.js
npm ci
MACOSX_DEPLOYMENT_TARGET=10.13 npm run build -- --target aarch64-apple-darwin
MACOSX_DEPLOYMENT_TARGET=10.13 npm run build -- --target x86_64-apple-darwin
```

## 还没验证的

排行榜调用需要开着 Steam 客户端、并且 App 在 Steamworks 里有排行榜。这台开发机没装 Steam，所以**只验证了编译、加载和接口形状，没有对真实 Steam 跑过**。第一次验证：在装了 Steam 的电脑上，用 App ID 480（Spacewar，Valve 的测试程序，自带排行榜）运行 `npm run steam:selftest -- --leaderboard "Feet Traveled"`。拿到正式 App ID 后，用正式 ID 再测一次。

## 和上游同步

上游没有排行榜，也没有合并计划。上游以后发新版时：把新版源码覆盖进来，保留 `src/api/leaderboard.rs`、`mod.rs` 里的一行、`.gitignore`、`check-binaries.mjs`，重新编译各平台。也可以把这个补丁作为 PR 提给上游，合并后就能改回用 npm 上的版本。
