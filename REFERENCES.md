# Références réglementaires vérifiées

Ces liens ont été utilisés pour contrôler les constantes et les formules du simulateur. Toutes les valeurs citées ci-dessous ont été relues le 15 novembre 2025 via les sources mentionnées.

## Mensualisation & plafond horaire

- [Droit-Finances – Grille tarifaire assistante maternelle 2025](https://droit-finances.commentcamarche.com/salaries/guide-salaries/1551-salaire-d-une-assistante-maternelle-taux-horaire-et-indemnites) : rappelle la formule de mensualisation _heures hebdomadaires × 52 ÷ 12_, utilisée pour `WEEKS_PER_YEAR / MONTHS_PER_YEAR`.
- [Parent Employeur Zen – Horaires de travail de la nounou](https://parent-employeur-zen.com/embauche/obligations-legales-pour-horaires) : précise qu’une garde à domicile ne peut pas dépasser 50 h par semaine (et 48 h en moyenne), ce qui justifie `MAX_WEEKLY_HOURS`.

## Cotisations sociales & déductions

- [Parent Employeur Zen – Garde à domicile : les changements de 2025](https://parent-employeur-zen.com/actualites/garde-a-domicile-changements-2025) : tableau des taux 2025 utilisé pour les constants `EMPLOYER_SOCIAL_RATE` (~47,4 %) et `EMPLOYEE_SOCIAL_RATE` (~22,05 %), ainsi que l’introduction de la « Contribution Santé au Travail » (2,7 % plafonnée à 5 €).
- [Économie.gouv – Emploi à domicile](https://www.economie.gouv.fr/emploi-domicile-ce-quil-faut-savoir-sur-le-statut-de-particulier-employeur) : confirme la déduction forfaitaire de 2 € par heure (`EMPLOYER_SOCIAL_DEDUCTION_PER_HOUR`).

## Complément de libre choix du mode de garde (CMG)

- [Décret n° 2025-515 du 30 mai 2025](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051714530) : décrit la formule du CMG, le plafond horaire de 15 €, l’encadrement des ressources mensuelles et le tableau des taux d’effort utilisés dans `getEffortRate`.
- [Parent Employeur Zen – Réforme CMG 2025](https://parent-employeur-zen.com/actualites/reforme-cmg-2025) : précise le coût horaire de référence (10,38 €) et les bornes de ressources mensuelles (635 € à 8 500 €) reprises dans `CMG_REFERENCE_HOURLY_COST`, `CMG_MIN_MONTHLY_RESOURCES` et `CMG_MAX_MONTHLY_RESOURCES`.
- [CAF – Réforme du CMG : foire aux questions](https://www.caf.fr/allocataires/actualites/actualites-nationales/reforme-du-cmg-la-foire-aux-questions) : confirme que 50 % des cotisations patronales sont prises en charge pour une garde d’enfants à domicile (`CMG_COTIS_RATE = 0.5`) et rappelle le plafond horaire de 15 € retenu par la CAF.

## Crédit d’impôt emploi à domicile

- [Service-Public – Crédit d’impôt salarié à domicile (version EN)](https://www.service-public.gouv.fr/particuliers/vosdroits/F12?lang=en) : détaille les plafonds de dépenses (12 000 € + majorations, 15 000 € la première année, 18 000 € maximum) utilisés dans `computeTaxCreditCap`.

Ces références sont également rappelées dans l’onglet « Références » de la barre latérale des résultats afin que l’utilisateur comprenne d’où proviennent les chiffres affichés.
