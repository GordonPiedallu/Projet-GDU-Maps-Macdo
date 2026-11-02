
import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import * as L from 'leaflet';
import { SelectionRestaurantService } from '../../selection-restaurant.service';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  imports: [],
  selector: 'app-map',
  styleUrl: './map.css',
  templateUrl: './map.html',
})
export class Map implements AfterViewInit, OnChanges {
  @Input() villeSelection: any;
  @Input() restaurantCible: any = null;

  @Output() restaurantSelectionne = new EventEmitter<void>();

  map!: L.Map;
  marqueurs = L.layerGroup();

  constructor(
    private selectionService: SelectionRestaurantService
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([48.8566, 2.3522], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.marqueurs.addTo(this.map);

    this.map.whenReady(() => {
      this.map.invalidateSize();

      if (this.villeSelection) {
        this.afficherRestaurant();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      return;
    }

    if (changes['villeSelection'] && this.villeSelection) {
      this.afficherRestaurant();
    }

    if (changes['restaurantCible'] && this.restaurantCible) {
      this.map.closePopup();

      const lat = Number(this.restaurantCible.lat);
      const lon = Number(this.restaurantCible.lon);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        this.centrerRestaurant(lat, lon, 16);
      }
    }
  }

  centrerRestaurant(lat: number, lon: number, zoom: number): void {
    this.map.whenReady(() => {
      this.map.invalidateSize({ pan: false });

      const position = L.latLng(lat, lon);
      const hauteurCarte = this.map.getSize().y;

      const decalageVertical =
        window.innerWidth <= 600
          ? hauteurCarte / 4
          : hauteurCarte / 10;

      const pointCentre = this.map.latLngToContainerPoint(position);

      const nouveauCentre = this.map.containerPointToLatLng(
        L.point(
          pointCentre.x,
          pointCentre.y - decalageVertical
        )
      );

      this.map.setView(nouveauCentre, zoom, {
        animate: true
      });
    });
  }

  centrerRestaurantSelectionne(
    lat: number,
    lon: number,
    zoom: number
  ): void {
    this.map.whenReady(() => {
      this.map.invalidateSize({ pan: false });

      const tailleCarte = this.map.getSize();

      const positionVerticale = window.innerWidth <= 600
        ? tailleCarte.y * 0.75
        : tailleCarte.y * 0.65;

      const positionHorizontale = tailleCarte.x / 2;

      const pointRestaurant = this.map.project(
        L.latLng(lat, lon),
        zoom
      );

      const centreCarte = L.point(
        tailleCarte.x / 2,
        tailleCarte.y / 2
      );

      const positionCible = L.point(
        positionHorizontale,
        positionVerticale
      );

      const nouveauCentrePixels = pointRestaurant.subtract(
        positionCible.subtract(centreCarte)
      );

      const nouveauCentre = this.map.unproject(
        nouveauCentrePixels,
        zoom
      );

      this.map.setView(nouveauCentre, zoom, {
        animate: true
      });
    });
  }

  afficherRestaurant(): void {
    const restaurants = Array.isArray(this.villeSelection)
      ? this.villeSelection
      : [this.villeSelection];

    this.marqueurs.clearLayers();

    const coordonnees: L.LatLngExpression[] = [];

    restaurants.forEach((restaurant: any) => {
      const lat = Number(restaurant.lat);
      const lon = Number(restaurant.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return;
      }

      coordonnees.push([lat, lon]);

      const nom = restaurant.display_name || "McDonald's";
      const marker = L.marker([lat, lon]);

      marker.bindPopup(`
        <b>${nom}</b><br><br>
        <button class="bouton-selectionner">Sélectionner</button>
      `);

      marker.on('popupopen', (event) => {
        const bouton = event.popup
          .getElement()
          ?.querySelector<HTMLButtonElement>('.bouton-selectionner');

        bouton?.addEventListener('click', () => {
          this.map.closePopup();

          this.selectionService.selectionnerRestaurant(restaurant);
          this.restaurantSelectionne.emit();

          this.centrerRestaurantSelectionne(lat, lon, 16);
        });
      });

      marker.addTo(this.marqueurs);
    });

    if (coordonnees.length > 0) {
      if (coordonnees.length === 1) {
        const [lat, lon] = coordonnees[0] as [number, number];

        this.centrerRestaurant(lat, lon, 15);
      } else {
        this.map.fitBounds(L.latLngBounds(coordonnees), {
          paddingTopLeft: [30, 190],
          paddingBottomRight: [30, 50],
          maxZoom: 15,
          animate: true,
        });
      }
    } else {
      console.warn('Aucun résultat avec des coordonnées valides.');
    }
  }
}
