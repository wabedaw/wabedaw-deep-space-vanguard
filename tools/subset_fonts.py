"""Re-subset the self-hosted CJK fonts after text with new characters is added (node tools/build.mjs warns).

    python3 tools/subset_fonts.py          # needs: pip install fonttools brotli

Writes assets/web/fonts/noto-sans-{sc,tc,jp}-{400,500,700,900}.woff2, holding only the characters each language
shows, and records each character set in assets/web/fonts/.subset-chars-{sc,tc,jp}.txt (build.mjs compares them):
  sc  Simplified Chinese: every character in the game's code and markup (the Chinese the code is written in)
  tc  Traditional Chinese: the zh-Hant table, plus the code's Chinese (untranslated strings fall back to it)
  jp  Japanese: the ja table (untranslated strings fall back to English), plus the language picker's names

The source fonts are Google Fonts' variable Noto Sans SC / TC / JP (SIL Open Font License 1.1). They are downloaded
once into FONT_CACHE (default ~/.cache/ashwing-fonts) from github.com/google/fonts.
"""
import os, json, string, urllib.request, io
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, 'assets', 'web', 'fonts')
CACHE = os.environ.get('FONT_CACHE', os.path.expanduser('~/.cache/ashwing-fonts'))
SRC = 'https://github.com/google/fonts/raw/main/ofl/'
FACES = {'sc': ('notosanssc', 'NotoSansSC'), 'tc': ('notosanstc', 'NotoSansTC'), 'jp': ('notosansjp', 'NotoSansJP')}
WEIGHTS = (400, 500, 700, 900)


def fetch(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print('downloading', url)
        with urllib.request.urlopen(url) as r, open(path + '.part', 'wb') as f:
            f.write(r.read())
        os.replace(path + '.part', path)
    return path


def game_text():
    manifest = json.load(open(os.path.join(ROOT, 'src', 'manifest.json'), encoding='utf-8'))
    texts = [open(os.path.join(ROOT, 'src', p['file']), encoding='utf-8').read() for p in manifest['parts']]
    for f in ('shell/head.html', 'shell/markup.html', 'shell/tail.html', 'style.css'):
        texts.append(open(os.path.join(ROOT, 'src', f), encoding='utf-8').read())
    return ''.join(texts)


def table_text(lang):
    return ''.join(json.load(open(os.path.join(ROOT, 'src', 'lang', lang + '.json'), encoding='utf-8')).values())


def charset(text):
    return sorted(set(ch for ch in text if ord(ch) > 127) | set(string.printable.strip()) | {' '})


code = game_text()
SETS = {'sc': charset(code), 'tc': charset(code + table_text('zh-Hant')), 'jp': charset(table_text('ja') + 'English简体中文繁體中文日本語')}

for key, (folder, name) in FACES.items():
    chars = ''.join(SETS[key])
    src = fetch(SRC + folder + '/' + name + '%5Bwght%5D.ttf', os.path.join(CACHE, name + '[wght].ttf'))
    lic = fetch(SRC + folder + '/OFL.txt', os.path.join(CACHE, name + '-OFL.txt'))
    open(os.path.join(FONTS, f'LICENSE-noto-sans-{key}.txt'), 'w', encoding='utf-8').write(open(lic, encoding='utf-8').read())
    open(os.path.join(FONTS, f'.subset-chars-{key}.txt'), 'w', encoding='utf-8').write(chars)
    for w in WEIGHTS:
        font = instancer.instantiateVariableFont(TTFont(src), {'wght': w})
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.hinting = False; opts.desubroutinize = True
        opts.name_IDs = ['*']; opts.notdef_outline = True
        sub = subset.Subsetter(opts); sub.populate(text=chars); sub.subset(font)
        out = os.path.join(FONTS, f'noto-sans-{key}-{w}.woff2')
        font.flavor = 'woff2'; font.save(out)
        print(f'{os.path.basename(out)}: {len(chars)} characters, {os.path.getsize(out) // 1024} KB')
