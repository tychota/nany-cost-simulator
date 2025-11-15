# Simulateur de coût – Nounou en garde partagée

Front-end Mantine/React qui calcule le coût d'une garde partagée à domicile en appliquant les règles CAF & fisc 2025. Tous les calculs sont effectués côté navigateur à partir des constantes définies dans `src/domain/constants.ts`.

## Pourquoi ce simulateur ?

- Vérifier rapidement le reste à charge d'une nounou employée via Pajemploi.
- Comprendre le détail du CMG (complément de libre choix du mode de garde) après la réforme en vigueur depuis septembre 2025.
- Anticiper l'impact du crédit d'impôt emploi à domicile (50 % des dépenses nettes d'aides).

## Sources officielles

Chaque constante ou formule est reliée à un texte officiel ou à une ressource CAF :

- **Décret n° 2025-515** (15 € nets/heure, taux d'effort, formule linéaire du CMG).
- **CAF – FAQ réforme CMG** (prise en charge de 50 % des cotisations patronales).
- **Parent Employeur Zen** (tableau des cotisations 2025 et contribution santé au travail).
- **Économie.gouv** (déduction forfaitaire de 2 € par heure déclarée).
- **Service-Public** (plafonds du crédit d'impôt emploi à domicile).
- **Droit-Finances** (formule de mensualisation 52/12).

Ces références sont listées dans `REFERENCES.md` et rappelées dans l'onglet « Références » de l'interface.

## Développement

```bash
pnpm install
pnpm run dev
pnpm run build
```

Les principaux fichiers à connaître :

- `src/domain/constants.ts` – paramètres ajustables (taux URSSAF, plafonds CMG, valeurs par défaut).
- `src/domain/calculator.ts` – cœur des calculs. Les commentaires renvoient aux textes utilisés.
- `src/components/InputsForm.tsx` – formulaire utilisateur (contrat nounou + foyers fiscaux).
- `src/components/ResultsSidebar.tsx` – onglets de synthèse, mensualisation, formules et références.

## Personnalisation

1. Modifie les constantes dans `src/domain/constants.ts` pour suivre de futures évolutions légales.
2. Les textes d'aide sont centralisés dans les composants, tu peux donc les adapter facilement à ta charte éditoriale.
3. Besoin d'une précision supplémentaire (plafonds CAF spécifiques, aides locales…) ? Ajoute une nouvelle section dans l'onglet « Formules » avec les références correspondantes.
