"""Build the standalone website package (web/) from the single-file game source (src/).

    python3 tools/build_web.py            # rebuild web/index.html + manifest
    python3 tools/build_web.py --fonts    # also re-subset the Chinese font (needs Noto Sans CJK + fonttools)

The source file is the same one published as the Claude artifact. The website build:
  * wraps it in a full HTML document with icons, manifest and social-preview meta,
  * defaults the language to the browser's language (zh-* -> Chinese, otherwise English),
  * swaps the Google Fonts link for the self-hosted fonts in web/fonts,
  * shows the leaderboard as a local, per-device ranking (no Claude database on a plain website).
"""
import os, re, sys, json, string, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src', 'deep-space-vanguard.html')
OUT = os.path.join(ROOT, 'web')
NOTO_DIR = os.environ.get('NOTO_CJK_DIR', '/usr/share/fonts/opentype/noto')


def rep(text, old, new, n=1):
    c = text.count(old)
    if c != n:
        sys.exit('ANCHOR FAIL (%d): %s' % (c, old[:120]))
    return text.replace(old, new)


s = open(SRC, encoding='utf-8').read()
i = s.index('<style>'); j = s.index('</style>\n') + len('</style>\n')
style, body = s[i:j], s[j:]

body = rep(body, "if (v === 'zh' || v === 'en') return v; } catch (e) {} return 'en'; })();",
                 "if (v === 'zh' || v === 'en') return v; } catch (e) {} return /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; })();")
body = rep(body, "  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap'; document.head.appendChild(lk);\n", "")
body = rep(body, "I18('排行榜需要在 Claude 中打开并登录才能使用 · 下面是这台设备上的成绩', 'The leaderboard needs this page opened in Claude while signed in · showing this device’s runs')",
                 "I18('本机排行 · 显示这台设备上的最好成绩', 'Local ranking · the best runs on this device')")
ext = [u for u in re.findall(r'https://[^\s\'"<>)]+', body) if u != 'https://…']
if ext:
    sys.exit('External URL left in the web build: %s' % ext[:5])

DESC_ZH = '驾驶 V-7 VEGA 截击机执行深空任务：穿越太空、外星地表与敌方基地，击败 38 位首领，直捣终焉之星。'
DESC_EN = 'Fly the V-7 VEGA interceptor on a deep-space mission across space, alien surfaces and fortress bases. Defeat 38 bosses and strike the Omega Star.'
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Deep Space Vanguard · 深空先锋</title>
<meta name="description" content="{DESC_ZH} {DESC_EN}">
<meta name="theme-color" content="#03050b">
<meta name="color-scheme" content="dark">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="深空先锋">
<meta property="og:type" content="website">
<meta property="og:title" content="深空先锋 · Deep Space Vanguard">
<meta property="og:description" content="{DESC_ZH}">
<meta property="og:image" content="og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="fonts/fonts.css">
<style>html,body{{margin:0;padding:0}}</style>
'''
html = head + style + '</head>\n<body>\n' + body.rstrip() + '\n</body>\n</html>\n'
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)

json.dump({
    'name': '深空先锋 · Deep Space Vanguard', 'short_name': '深空先锋', 'description': DESC_ZH,
    'start_url': './', 'scope': './', 'display': 'fullscreen', 'orientation': 'any',
    'background_color': '#03050b', 'theme_color': '#03050b', 'lang': 'zh-CN',
    'icons': [{'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
              {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
              {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]
}, open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# The Chinese font is a subset containing only the characters the game uses.
chars = sorted(set(ch for ch in s if ord(ch) > 127) | set(string.printable.strip()) | {' '})
if '--fonts' in sys.argv:
    txt = os.path.join(OUT, 'fonts', '.chars.txt')
    open(txt, 'w', encoding='utf-8').write(''.join(chars))
    for w, face in [(400, 'Regular'), (500, 'Medium'), (700, 'Bold'), (900, 'Black')]:
        subprocess.run(['pyftsubset', os.path.join(NOTO_DIR, f'NotoSansCJK-{face}.ttc'), '--font-number=2', f'--text-file={txt}',
                        '--flavor=woff2', f'--output-file={OUT}/fonts/noto-sans-sc-{w}.woff2', '--layout-features=*',
                        '--no-hinting', '--desubroutinize'], check=True)
    os.remove(txt)
else:
    try:
        from fontTools.ttLib import TTFont
        cmap = TTFont(os.path.join(OUT, 'fonts', 'noto-sans-sc-400.woff2')).getBestCmap()
        missing = [c for c in chars if ord(c) > 0x2e7f and ord(c) not in cmap]
        if missing:
            print('WARNING: %d characters are not in the Chinese font subset (%s); run with --fonts' % (len(missing), ''.join(missing[:20])))
    except ImportError:
        pass
print('built web/index.html', len(html), 'bytes')
