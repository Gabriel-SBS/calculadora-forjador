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

# A ordem importa: todos os arquivos viram uma função só, então cada camada
# só pode usar o que veio antes dela na hora de rodar.
#   data/   catálogos do Guia (sem lógica)
#   core/   utilitários sem regra de jogo (util.js não toca no DOM)
#   regras/ contas puras sobre o estado; são estas que os testes chamam
#   ui/     cada oficina lê a tela, chama regras/ e desenha o resultado
APP_PARTS = [
    SRC / "data" / "forja.js",
    SRC / "data" / "bombas.js",
    SRC / "data" / "ramos.js",
    SRC / "data" / "herbalismo.js",
    SRC / "core" / "util.js",
    SRC / "regras" / "estado.js",
    SRC / "regras" / "forja.js",
    SRC / "regras" / "bombas.js",
    SRC / "regras" / "herbalismo.js",
    SRC / "core" / "combo.js",
    SRC / "core" / "campo-moeda.js",
    SRC / "ui" / "forja.js",
    SRC / "ui" / "lista.js",
    SRC / "ui" / "oficinas.js",
    SRC / "ui" / "bombas.js",
    SRC / "ui" / "herbalismo.js",
    SRC / "ui" / "init.js",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def build() -> Path:
    template = read(SRC / "template.html")
    styles = read(SRC / "styles.css")
    app_js = "\n".join(read(p).rstrip("\n") for p in APP_PARTS)
    controles_js = read(SRC / "ui" / "controles.js").rstrip("\n")
    tema_js = read(SRC / "ui" / "tema.js").rstrip("\n")
    particulas_js = read(SRC / "ui" / "particulas.js").rstrip("\n")

    out = (
        template
        .replace("/* {{STYLES}} */", styles, 1)
        .replace("/* {{APP_JS}} */", app_js, 1)
        .replace("/* {{CONTROLES_JS}} */", controles_js, 1)
        .replace("/* {{TEMA_JS}} */", tema_js, 1)
        .replace("/* {{PARTICULAS_JS}} */", particulas_js, 1)
    )

    for marker in ("{{STYLES}}", "{{APP_JS}}", "{{CONTROLES_JS}}", "{{TEMA_JS}}", "{{PARTICULAS_JS}}"):
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
