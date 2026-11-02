# Mac Donald

Projet Angular conservé dans une structure simple, avec la recherche Nominatim et la carte Leaflet.

## Lancer le projet

1. Ouvrir le dossier dans le terminal.
2. Installer les dépendances : `npm ci`
3. Lancer l'application : `npm start`
4. Ouvrir `http://localhost:4200`.

## Fonctionnement

- La recherche utilise Nominatim uniquement.
- L'URL contient toujours `McDonald's`, puis le nom de la ville saisi.
- Les résultats viennent de Nominatim.
- Cliquer sur un résultat affiche ce restaurant sur la carte Leaflet.
- Overpass a été supprimé du service et du composant de carte.

Remarque : Nominatim ne garantit pas de trouver tous les restaurants d'une ville. Les résultats dépendent des données OpenStreetMap et de la recherche textuelle.
