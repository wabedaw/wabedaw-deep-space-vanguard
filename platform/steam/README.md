# Steam 桌面版（Electron）

游戏代码和网站版是同一份（`src/`）。这里是把它装进桌面程序、接上 Steam 的外壳。

| 文件 | 作用 |
|---|---|
| `main.js` | 主进程：窗口、Steamworks（steamworks.js）、存档文件读写、全屏切换 |
| `leaderboards.js` | 排行榜桥：检查页面传来的榜名、分数、details，再调用 Steam（`npm test` 跑它的单元测试） |
| `native/steamworks.js/` | 自带的 steamworks.js 修改版（加了排行榜），说明见 `native/PATCHES.md` |
| `preload.js` | 游戏页面和主进程之间唯一的桥：`window.ashwingNative`，游戏里通过 `PLATFORM`（`src/js/platform/platform.js`）调用 |
| `app/` | 游戏本体，由仓库根目录的 `npm run build` 生成（不进 Git） |
| `build/icon.png` | 程序图标（electron-builder 自动转成 .ico / .icns）。**还是 v0.1 的图标，换皮时替换** |
| `steam_appid.txt` | 开发时用的 App ID（480 = Valve 公开的测试程序 Spacewar），**不会打进发行包** |
| `package.json` | `steamAppId`：拿到正式 App ID 后填这里（发行包靠它在 Steam 外启动时自动转交给 Steam） |
| `steampipe/` | 上传到 Steam 的构建脚本 |

## 常用命令（在仓库根目录 `01_code/` 运行）

```bash
npm run steam:install      # 第一次：安装 Electron、electron-builder、steamworks.js（约 110 MB）
npm run steam:start        # 构建并以窗口模式运行
npm run steam:selftest     # 构建、启动、检查桥接与存档写盘，然后自动退出
npm --prefix platform/steam run selftest -- --leaderboard "Feet Traveled"   # 另外读一次真实排行榜（要开着 Steam；App 480 用 Spacewar 的榜）
npm --prefix platform/steam test   # 排行榜桥的单元测试（不需要 Steam）
npm --prefix platform/steam run check:native   # 各平台原生库有没有排行榜补丁
npm run steam:dist:win     # 打包 Windows 版 → dist/steam/win-unpacked/
npm run steam:dist:linux   # 打包 Linux 版 → dist/steam/linux-unpacked/（未实测）
npm run steam:dist:mac     # 打包 macOS 通用版 → dist/steam/mac-universal/（未实测；Mac 版需要 Apple 签名与公证）
```

打包出的是文件夹（`dir` 目标），不是安装程序：Steam 自己负责安装和更新。

## 运行时行为

- **默认全屏**，F11 或 Alt+Enter 切换；`--windowed` 参数以窗口启动。
- **Steam 没开时**游戏照常运行，只是没有成就、云存档等 Steam 功能（终端会打印 `[steam] unavailable`）。
- **存档**：`<用户数据>/save/ashwing-save.json`（Windows 是 `%APPDATA%\ASHWING\save\`），先写临时文件再改名，崩溃不会留下半个存档。在 Steamworks 里把这个文件夹设为 Steam 自动云（Auto-Cloud），见 `07_release/Steamworks 配置.md`。
- **成就与统计**：游戏调用 `SAVE.unlock('ACH_…')` / `SAVE.bump('STAT_…')`，经桥接转给 Steam。名字必须和 Steamworks 后台一致，清单见 `07_release/成就设计.csv`。
- **语言**：玩家没选过语言时，跟随 Steam 客户端语言（简中 / 繁中 / 英 / 日）。
- **安全**：页面没有 Node 权限（contextIsolation + sandbox），只能本地加载，外部链接用系统浏览器打开，有内容安全策略（CSP）。

## 上传到 Steam

1. 在 `steampipe/steam.config.json` 填好 App ID 和各平台的 Depot ID（Steamworks → SteamPipe → Depots）。
2. `npm run steam:dist:win`
3. `node platform/steam/steampipe/make-build.mjs --desc "版本说明"` 生成 `dist/steam/app_build_<AppID>.vdf`，并打印上传命令。
4. 用 Valve 的 steamcmd 自己执行打印出来的命令（需要登录构建账号、Steam 令牌确认）。上传后不会自动上线，到 Steamworks → SteamPipe → 构建 里选择分支发布。

Demo 是单独的 App：在 `steam.config.json` 的 `demo` 里填它的 ID，用 `make-build.mjs --demo`。

## 已知限制

- **排行榜**：npm 上的 steamworks.js 没有排行榜，所以改用自带的修改版（`native/PATCHES.md`）。macOS 两个版本已编译；**Windows 和 Linux 还是上游二进制，要跑一次 GitHub Actions 的 "steamworks native" 才有排行榜**。没有排行榜的二进制下，游戏的排行榜显示本机成绩，其余功能不受影响。排行榜还没在真实 Steam 上跑过（开发机没装 Steam）。
- **Windows 版只在 macOS 上交叉打包过，没有在 Windows 上运行过**。第一次上传前要在 Windows 电脑和 Steam Deck 上各跑一遍 `--selftest` 和完整试玩。
- 发行包里带了三个平台的 steamworks 原生库（约 9 MB），以后可以按平台裁掉。
