# Pokémon : prépare labo/datasets/pokemon.js, les données du tableau de bord de la fiche pokemon-stats.
# Usage : py labo/datasets/pokemon-prepare.py chemin/vers/pokemons.csv
# Ne garde que les colonnes publiques : nom, types, génération, stats, taille, poids, talents, évolution, attaques.
# Les attaques et les talents sont remplacés par leur numéro dans une liste triée, codé en base 36 sur 2 caractères :
# le fichier passe de 1,5 Mo à environ 0,3 Mo.
import csv, json, sys, unicodedata
from collections import Counter
from pathlib import Path

STATS = ['pv', 'attaque', 'defense', 'attaque_spe', 'defense_spe', 'vitesse']
REGIONS = ['-alola', '-galar', '-hisui', '-paldea']


def cle(s):
    # Tri alphabétique à la française : accents ignorés, puis casse
    return (unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower(), s)


def forme(r):
    if r['forme_par_defaut'] == 'oui':
        return 'base'
    api = r['identifiant_api']
    if r['nom_fr'].startswith(('Méga-', 'Primo-')) or api.endswith('-mega') or '-mega-' in api or api.endswith('-primal'):
        return 'mega'
    if any(x in api for x in REGIONS):
        return 'regionale'
    if '-gmax' in api:
        return 'gigamax'
    return 'autre'


def b36(i):
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    return digits[i // 36] + digits[i % 36]


def main(src):
    rows = list(csv.DictReader(open(src, encoding='utf-8-sig'), delimiter=';'))
    split = lambda s: [x for x in s.split(' | ') if x]
    attaques = sorted({m for r in rows for m in split(r['attaques'])}, key=cle)
    talents = sorted({t for r in rows for t in split(r['talents']) + split(r['talent_cache'])}, key=cle)
    assert len(attaques) < 36 ** 2 and len(talents) < 36 ** 2
    ia = {m: i for i, m in enumerate(attaques)}
    it = {t: i for i, t in enumerate(talents)}
    # Un Pokémon est « final » si aucune autre espèce n'évolue de lui. Une forme alternative reprend le statut de
    # sa forme de base (Rattata d'Alola évolue comme Rattata), sauf Méga, Primo et Gigamax, toujours finales,
    # et les Pikachu costumés ou à casquette, qui n'évoluent pas.
    parents = {r['evolue_de_fr'] for r in rows if r['evolue_de_fr']}
    final_base = {r['espece_id']: r['nom_fr'] not in parents for r in rows if r['forme_par_defaut'] == 'oui'}

    def est_final(r):
        f = forme(r)
        if f == 'base':
            return r['nom_fr'] not in parents
        if f in ('mega', 'gigamax') or r['identifiant_api'].startswith('pikachu-'):
            return True
        return final_base[r['espece_id']]

    out = []
    for r in rows:
        assert int(r['total_stats']) == sum(int(r[k]) for k in STATS), r['nom_fr']
        out.append([
            int(r['id']), int(r['espece_id']), r['nom_fr'], r['nom_en'], int(r['generation']),
            r['type_1'], r['type_2'], *[int(r[k]) for k in STATS],
            float(r['taille_m']), float(r['poids_kg']),
            ''.join(b36(it[t]) for t in split(r['talents'])), b36(it[r['talent_cache']]) if r['talent_cache'] else '',
            int(r['stade_evolution']), r['evolue_de_fr'], 1 if est_final(r) else 0, forme(r),
            ''.join(b36(ia[m]) for m in split(r['attaques'])),
        ])

    data = {
        'source': 'pokemons.csv, 1 351 Pokémon et formes, générations 1 à 9',
        'colonnes': ['id', 'espece', 'nom', 'nomEn', 'gen', 'type1', 'type2', 'pv', 'attaque', 'defense', 'attaqueSpe', 'defenseSpe', 'vitesse',
                     'taille', 'poids', 'talents', 'talentCache', 'stade', 'evolueDe', 'final', 'forme', 'attaques'],
        'talents': talents,
        'attaques': attaques,
        'pokemons': out,
    }
    js = ('// Généré par labo/datasets/pokemon-prepare.py : ne pas modifier à la main.\n'
          '// talents et attaques : numéros dans les listes du même nom, en base 36 sur 2 caractères.\n'
          'window.LABO_POKEMON = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    dest = Path(__file__).with_name('pokemon.js')
    dest.write_text(js, encoding='utf-8')
    print(f'{dest} : {len(out)} lignes, {len(talents)} talents, {len(attaques)} attaques, {len(js.encode()) / 1024:.0f} Ko')
    print(Counter(forme(r) for r in rows))


if __name__ == '__main__':
    main(sys.argv[1])
