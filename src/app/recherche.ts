import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Recherche {
  constructor(private http: HttpClient) {}

  rechercheNominatim(ville: string) {
  return this.http.get(
    `https://nominatim.openstreetmap.org/search?q=McDonald's ${encodeURIComponent(ville)}&countrycodes=fr&format=json`
  );
}}
