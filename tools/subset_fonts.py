"""Re-subset the self-hosted Chinese font after new Chinese text is added to the game.

    node tools/build.mjs                # warns when the subset is missing characters
    python3 tools/subset_fonts.py       # needs fonttools (pip install fonttools brotli) and Noto Sans CJK

Writes assets/web/fonts/noto-sans-sc-{400,500,700,900}.woff2 and records the character set in
assets/web/fonts/.subset-chars.txt. Set NOTO_CJK_DIR if NotoSansCJK-*.ttc lives somewhere else.
"""
import os, string, subprocess, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'assets', 'web', 'fonts')
NOTO_DIR = os.environ.get('NOTO_CJK_DIR', '/usr/share/fonts/opentype/noto')

manifest = json.load(open(os.path.join(ROOT, 'src', 'manifest.json'), encoding='utf-8'))
texts = [open(os.path.join(ROOT, 'src', p['file']), encoding='utf-8').read() for p in manifest['parts']]
for f in ('shell/head.html', 'shell/markup.html', 'shell/tail.html', 'style.css'):
    texts.append(open(os.path.join(ROOT, 'src', f), encoding='utf-8').read())
chars = sorted(set(ch for t in texts for ch in t if ord(ch) > 127) | set(string.printable.strip()) | {' '})
txt = os.path.join(FONTS, '.subset-chars.txt')
open(txt, 'w', encoding='utf-8').write(''.join(chars))
for w, face in [(400, 'Regular'), (500, 'Medium'), (700, 'Bold'), (900, 'Black')]:
    subprocess.run(['pyftsubset', os.path.join(NOTO_DIR, f'NotoSansCJK-{face}.ttc'), '--font-number=2', f'--text-file={txt}',
                    '--flavor=woff2', f'--output-file={FONTS}/noto-sans-sc-{w}.woff2', '--layout-features=*',
                    '--no-hinting', '--desubroutinize'], check=True)
print('subset', len(chars), 'characters')
