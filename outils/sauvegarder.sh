#!/bin/bash
# Sauvegarde des fichiers du site AVANT modification.
# Usage : bash sauvegarder.sh "description-courte" www/index.html www/assets/css/style.css ...
#         bash sauvegarder.sh "description-courte" --tout     (copie complète de www en .zip)
# Les copies vont dans Dev/as2c-sauvegardes/AAAA-MM-JJ_HHMMSS_description/ en gardant les chemins.
set -e
ICI="$(cd "$(dirname "$0")/.." && pwd)"          # .../Dev/as2c
DEST_RACINE="$(dirname "$ICI")/as2c-sauvegardes"  # .../Dev/as2c-sauvegardes
LIBELLE="${1:?Donner une description}"; shift
DEST="$DEST_RACINE/$(date +%Y-%m-%d_%H%M%S)_${LIBELLE// /-}"
mkdir -p "$DEST"
cd "$ICI"
if [ "$1" = "--tout" ]; then
  python3 -c "import shutil,sys; shutil.make_archive(sys.argv[1], 'zip', '.', 'www')" "$DEST/www"
else
  for f in "$@"; do
    if [ -e "$f" ]; then mkdir -p "$DEST/$(dirname "$f")"; cp -p "$f" "$DEST/$f"
    else echo "(nouveau fichier, rien à sauvegarder) $f" >> "$DEST/NOUVEAUX.txt"; fi
  done
fi
echo "$DEST"
