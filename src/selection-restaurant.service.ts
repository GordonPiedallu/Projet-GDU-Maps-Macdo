
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectionRestaurantService {
  villeSelectionnee = signal<string>('');
  listeRestaurants = signal<any[]>([]);
  restaurantSelectionne = signal<any>(null);

  definirVille(ville: string) {
    this.villeSelectionnee.set(ville);
  }

  definirRestaurants(restaurants: any[]) {
    this.listeRestaurants.set(restaurants);
  }

  selectionnerRestaurant(restaurant: any) {
    this.restaurantSelectionne.set(restaurant);
  }

  annulerSelection() {
    this.restaurantSelectionne.set(null);
  }
}
