import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-restaurant',
  styleUrl: './restaurant.css',
  templateUrl: './restaurant.html',
})



export class Restaurant {
@Input()
  nomRestaurant = "";

@Output()
  restaurantSelectionne = new EventEmitter<string>();
}
