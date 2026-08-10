#!/usr/bin/env python3
"""Build the self-hosted critical variable font used by the SSR landing page.

Run with: uv run --with 'fonttools[woff]' scripts/subset-pretendard-font.py
"""

from __future__ import annotations

import argparse
import sys
import unicodedata
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FONT = ROOT / "assets/fonts/PretendardVariable.source.woff2"
OUTPUT_FONT = ROOT / "public/fonts/PretendardVariable.critical.woff2"
GLYPH_MANIFEST = ROOT / "public/fonts/PretendardVariable.critical.glyphs.txt"
SOURCE_DIRS = (ROOT / "src",)
SOURCE_SUFFIXES = {".css", ".ts", ".tsx"}
FAMILY_NAME = "FUTUR Sans Critical"


def collect_characters() -> str:
    characters = {chr(codepoint) for codepoint in range(0x20, 0x7F)}
    characters.update({"\n", "\u00a0"})

    for source_dir in SOURCE_DIRS:
        for path in source_dir.rglob("*"):
            if not path.is_file() or path.suffix not in SOURCE_SUFFIXES:
                continue

            for character in path.read_text(encoding="utf-8"):
                category = unicodedata.category(character)
                if ord(character) > 0x7F and not category.startswith("C"):
                    characters.add(character)

    return "".join(sorted(characters, key=ord))


def rename_font(font: TTFont) -> None:
    for record in font["name"].names:
        try:
            value = record.toUnicode()
        except UnicodeDecodeError:
            continue

        if "Pretendard" not in value:
            continue

        renamed = value.replace("Pretendard Variable", FAMILY_NAME).replace(
            "Pretendard", FAMILY_NAME
        )
        record.string = renamed.encode(record.getEncoding(), errors="replace")


def build_font(max_kilobytes: int) -> None:
    if not SOURCE_FONT.exists():
        raise FileNotFoundError(f"source font not found: {SOURCE_FONT}")

    characters = collect_characters()
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.notdef_glyph = True
    options.recommended_glyphs = True
    options.drop_tables = []

    font = subset.load_font(str(SOURCE_FONT), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=characters)
    subsetter.subset(font)
    rename_font(font)
    OUTPUT_FONT.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(OUTPUT_FONT), options)

    verification_font = TTFont(str(OUTPUT_FONT))
    cmap = verification_font.getBestCmap() or {}
    missing = [character for character in characters if character != "\n" and ord(character) not in cmap]
    if missing:
        raise RuntimeError(f"critical font is missing {len(missing)} characters: {missing[:20]}")

    GLYPH_MANIFEST.write_text(characters, encoding="utf-8")
    size = OUTPUT_FONT.stat().st_size
    if size > max_kilobytes * 1024:
        raise RuntimeError(
            f"critical font is {size / 1024:.1f} KiB; expected <= {max_kilobytes} KiB"
        )

    print(f"wrote {OUTPUT_FONT.relative_to(ROOT)} ({size / 1024:.1f} KiB)")
    print(f"covered {len(characters)} characters")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-kilobytes", type=int, default=400)
    args = parser.parse_args()

    try:
        build_font(args.max_kilobytes)
    except (FileNotFoundError, RuntimeError) as error:
        print(error, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
