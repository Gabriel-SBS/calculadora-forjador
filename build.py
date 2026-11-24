"""Empacota src/ em um único index.html (GitHub Pages + uso offline por duplo-clique).

Uso:
  python build.py          # gera index.html
  python build.py --sync   # gera index.html e atualiza as cópias offline
"""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

APP_PARTS = [
    SRC / "data" / "forja.js",
    SRC / "data" / "bombas.js",
    SRC / "data" / "herbalismo.js",
    SRC / "js" / "forja.js",
    SRC / "js" / "lista.js",
    SRC / "js" / "oficinas.js",
    SRC / "js" / "bombas.js",
    SRC / "js" / "herbalismo.js",
    SRC / "js" / "init.js",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build() -> Path:
    template = read(SRC / "template.html")
    styles = read(SRC / "styles.css")
    app_js = "\n".join(read(p).rstrip("\n") for p in APP_PARTS)
    tema_js = read(SRC / "js" / "tema.js").rstrip("\n")
    particulas_js = read(SRC / "js" / "particulas.js").rstrip("\n")

    out = (
        template
        .replace("/* {{STYLES}} */", styles, 1)
        .replace("/* {{APP_JS}} */", app_js, 1)
        .replace("/* {{TEMA_JS}} */", tema_js, 1)
        .replace("/* {{PARTICULAS_JS}} */", particulas_js, 1)
    )

    for marker in ("{{STYLES}}", "{{APP_JS}}", "{{TEMA_JS}}", "{{PARTICULAS_JS}}"):
        if marker in out:
            raise RuntimeError(f"Placeholder não substituído: {marker}")

    target = ROOT / "index.html"
    target.write_text(out, encoding="utf-8", newline="\n")
    print(f"Gerado: {target} ({target.stat().st_size:,} bytes, {out.count(chr(10)) + 1} linhas)")
    return target


def sync_offline(built: Path) -> None:
    parent = ROOT.parent
    for folder in ("jordan rpg", "tharion rpg"):
        dest = parent / folder / "calculadora-forjador.html"
        if dest.parent.exists():
            shutil.copy2(built, dest)
            print(f"Copiado: {dest}")


if __name__ == "__main__":
    built = build()
    if "--sync" in sys.argv:
        sync_offline(built)
