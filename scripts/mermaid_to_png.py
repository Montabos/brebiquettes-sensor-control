"""Extract Mermaid blocks from architecture-pipeline.md and render PNGs."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

NAMES = [
    "a-pipeline-7-etapes",
    "b-local-vs-cloud",
    "c-cycle-evenement",
    "01-vue-ensemble",
    "02-sequence-temps-reel",
    "03-lineage-donnees",
    "04-controles-qualite",
    "05-modele-donnees-er",
    "06-zones-surveillees",
    "07-gestion-erreurs",
    "08-cicd-deploiement",
    "09-continuite-blocs",
    "10-redpanda-vs-batch",
]

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "architecture-pipeline.md"
OUT_DIR = ROOT / "docs" / "images" / "architecture-pipeline"
TMP_DIR = ROOT / "docs" / ".mermaid-tmp"


def extract_mermaid_blocks(content: str) -> list[str]:
    pattern = re.compile(r"```mermaid\n(.*?)```", re.DOTALL)
    return [m.group(1).strip() for m in pattern.finditer(content)]


def render_png(mermaid_src: str, out_path: Path) -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    mmd_file = TMP_DIR / f"{out_path.stem}.mmd"
    mmd_file.write_text(mermaid_src, encoding="utf-8")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "npx",
        "--yes",
        "@mermaid-js/mermaid-cli",
        "-i",
        str(mmd_file),
        "-o",
        str(out_path),
        "-b",
        "white",
        "-w",
        "1920",
        "-H",
        "1080",
        "--scale",
        "2",
    ]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, shell=True)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"Failed to render {out_path.name}")


def replace_mermaid_with_images(content: str, names: list[str]) -> str:
    idx = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal idx
        if idx >= len(names):
            return match.group(0)
        name = names[idx]
        idx += 1
        rel = f"images/architecture-pipeline/{name}.png"
        return f"![Diagramme {name}]({rel})"

    return re.sub(r"```mermaid\n.*?```", replacer, content, flags=re.DOTALL)


def main() -> None:
    content = MD_PATH.read_text(encoding="utf-8")
    blocks = extract_mermaid_blocks(content)
    if len(blocks) != len(NAMES):
        raise SystemExit(f"Expected {len(NAMES)} diagrams, found {len(blocks)}")

    for name, block in zip(NAMES, blocks):
        out = OUT_DIR / f"{name}.png"
        print(f"Rendering {out.name}...")
        render_png(block, out)

    updated = replace_mermaid_with_images(content, NAMES)
    MD_PATH.write_text(updated, encoding="utf-8")
    print(f"Updated {MD_PATH}")
    print(f"Generated {len(blocks)} PNGs in {OUT_DIR}")


if __name__ == "__main__":
    main()
