
import { Component, signal } from '@angular/core';
import { Search } from './search/search';
import { Map } from './map/map';
import { SelectionRestaurantService } from '../selection-restaurant.service';

@Component({
  imports: [Search, Map],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  get villeSelection() {
    return this.selectionService.listeRestaurants();
  }

  protected readonly title = signal('mac_donald');

  message = "Bienvenue sur l'application de gestion des restaurants !";

  confirmationOuverte = false;
  panneauReplie = false;
  restaurantCible: any = null;

  constructor(public selectionService: SelectionRestaurantService) {}

  recevoirVille(restaurants: any[]) {
    this.selectionService.definirRestaurants(restaurants);

    // Une nouvelle recherche réinitialise le ciblage précédent.
    this.restaurantCible = null;

    if (restaurants.length > 0) {
      this.message = `${restaurants.length} résultat(s) trouvé(s).`;
    } else {
      this.message = 'Aucun résultat trouvé.';
    }

    console.log('Résultats transmis à la carte :', restaurants);
  }

  centrerSurRestaurant(restaurant: any) {
    this.restaurantCible = restaurant;
  }

  annulerSelection() {
    this.selectionService.annulerSelection();
    this.confirmationOuverte = false;
  }

  continuer() {
    const restaurant = this.selectionService.restaurantSelectionne();

    if (restaurant) {
      this.message = `Vous continuez avec : ${restaurant.display_name}`;
      this.confirmationOuverte = false;
    }
  }
}
