#!/usr/bin/env bash
set -euo pipefail

# Emplacement exact du script (ex: /home/clem/IdeaProjects/projects)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Priorité : 1. Premier argument ($1) -> 2. Variable $PROJECTS_DIR -> 3. Le dossier du script lui-même
PROJECTS_DIR="${1:-${PROJECTS_DIR:-$SCRIPT_DIR}}"

# projects.json est toujours créé au même niveau que le script et index.html
OUTPUT_FILE="${OUTPUT_FILE:-$SCRIPT_DIR/projects.json}"

if ! command -v jq >/dev/null 2>&1; then
  echo "Erreur : jq n'est pas installé. Installe-le avec: sudo apt install jq" >&2
  exit 1
fi

if [ ! -d "$PROJECTS_DIR" ]; then
  echo "Erreur : le dossier cible $PROJECTS_DIR n'existe pas." >&2
  exit 1
fi

items=()

shopt -s nullglob
for meta_file in "$PROJECTS_DIR"/*/.project.json; do
  project_dir="$(basename "$(dirname "$meta_file")")"

  if ! jq empty "$meta_file" >/dev/null 2>&1; then
    echo "Attention : $meta_file n'est pas un JSON valide, ignoré." >&2
    continue
  fi

  # Injection du slug et fallback pour description_en si absente
  enriched="$(jq -c --arg slug "$project_dir" '
    . + {
      slug: $slug,
      description_en: (.description_en // .description)
    }
  ' "$meta_file")"

  items+=("$enriched")
done
shopt -u nullglob

# Construction du tableau JSON
if [ ${#items[@]} -eq 0 ]; then
  echo "[]" > "$OUTPUT_FILE"
else
  printf '%s\n' "${items[@]}" | jq -s 'sort_by(.name // .slug)' > "$OUTPUT_FILE"
fi

echo "OK : $(jq length "$OUTPUT_FILE") projet(s) scanné(s) depuis $PROJECTS_DIR -> écrit(s) dans $OUTPUT_FILE"