# 深空先锋 · Deep Space Vanguard

**v0.1 测试版 / Test build**

驾驶 V-7 VEGA 截击机执行深空任务：穿越太空、外星地表与敌方基地，击败 38 位首领，直捣终焉之星。
HTML5 Canvas 射击游戏，纵版与横版交替，支持键鼠和手机触屏，中英双语。

Fly the V-7 VEGA interceptor on a deep-space mission across open space, alien surfaces and fortress bases. Defeat 38 bosses and strike the Omega Star. An HTML5 canvas shooter that switches between vertical and horizontal flight, playable with keyboard/mouse or touch, in Chinese and English.

![Cover](promo/cover-square-en-1080.jpg)

## 目录 / Layout

| 路径 | 内容 |
|---|---|
| `src/deep-space-vanguard.html` | 游戏源码（单文件，与 Claude 中的版本相同）· Game source, single file |
| `web/` | 网站发布包，整个文件夹上传即可 · Website build, upload as-is |
| `tools/build_web.py` | 由 `src/` 生成 `web/` · Builds `web/` from `src/` |
| `tests/smoke_test.py` | 网站包冒烟测试 · Smoke test of the website build |
| `tests/campaign_bot.py` | 全流程机器人测试（开无敌，只验证流程，不验证难度）· Full-campaign bot (invincible; checks flow, not difficulty) |
| `promo/` | 封面与宣传图 · Covers and key art |
| `docs/` | 部署说明、v0.1 评估 · Deployment guide, v0.1 review |

## 本地运行 / Run locally

```bash
python3 -m http.server -d web 8000
# 打开 / open http://localhost:8000
```

也可以直接双击 `web/index.html`。 You can also open `web/index.html` directly.

## 修改后重新构建 / Rebuild after editing

```bash
python3 tools/build_web.py           # 更新 web/index.html
python3 tools/build_web.py --fonts   # 新增了中文字符时，重新生成中文字体子集
python3 tests/smoke_test.py          # 需要 Python Playwright
```

## 操作 / Controls

| 操作 | 键盘 | 触屏 |
|---|---|---|
| 移动 Move | WASD / 方向键 / 鼠标拖动 | 拖动 |
| 射击 Fire | 默认自动射击；空格手动射击，F 开关自动 | 自动 |
| 追踪导弹 Homing missiles | Shift / X / 鼠标右键 | 导弹按钮 |
| 切换武器 Spread / Beam | Q / 1 / 2 | 武器按钮 |
| 全屏爆炸 Nova（每 10 个 M 充能一次） | E | 爆炸按钮 |
| 暂停 · 静音 · 音乐 | P · M · N | 暂停按钮 |

每收集 10 个 W 自动发动 Starbreaker 超级武器 10 秒。 Every 10 W pickups fire the Starbreaker for 10 s.

## 版本 / Version

见 [CHANGELOG.md](CHANGELOG.md)。

## 授权 / License

All rights reserved. 游戏代码与美术未开源，未经许可不得复制或再发布。
字体为 SIL Open Font License 1.1，授权文件在 `web/fonts/`。
Fonts are under the SIL Open Font License 1.1 (see `web/fonts/LICENSE-*.txt`).
