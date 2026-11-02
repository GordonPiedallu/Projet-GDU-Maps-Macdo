
import {
  Component,
  Output,
  EventEmitter,
  signal,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
  tap,
  takeUntil
} from 'rxjs/operators';

import { of, Subject, merge } from 'rxjs';

import { Recherche } from '../recherche';
import { SelectionRestaurantService } from '../../selection-restaurant.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-search',
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit, OnDestroy {
  response = signal<any[]>([]);
  villeSelectionner = signal<any>(null);

  message = '';
  derniereVilleRecherchee = '';
  rechercheEnCours = false;

  private destruction$ = new Subject<void>();
  private rechercheDemandee$ = new Subject<string>();

  ville = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(2)
    ]
  });

  @Output()
  villeSelection = new EventEmitter<any>();

  @Output()
  restaurantCible = new EventEmitter<any>();

  constructor(
    private rechercheService: Recherche,
    private selectionService: SelectionRestaurantService
  ) {}

  ngOnInit(): void {
    this.ville.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((ville) => ville.trim().length >= 2),
      takeUntil(this.destruction$)
    ).subscribe((ville) => {
      this.rechercheDemandee$.next(ville.trim());
    });

    this.rechercheDemandee$.pipe(
      switchMap((nomVille) => {
        this.message = 'Recherche en cours...';
        this.rechercheEnCours = true;

        this.response.set([]);
        this.villeSelectionner.set(null);
        this.restaurantCible.emit(null);

        return this.rechercheService.rechercheNominatim(nomVille).pipe(
          catchError((erreur) => {
            console.error('Erreur Nominatim :', erreur);

            this.message = 'La recherche a échoué. Réessayez.';
            this.rechercheEnCours = false;
            this.response.set([]);
            this.selectionService.definirRestaurants([]);
            this.villeSelection.emit([]);

            return of(null);
          })
        );
      }),
      takeUntil(this.destruction$)
    ).subscribe((resultats: any) => {
      this.rechercheEnCours = false;

      if (resultats === null) {
        return;
      }

      if (!Array.isArray(resultats)) {
        this.message = 'La réponse du serveur est invalide.';
        this.response.set([]);
        this.selectionService.definirRestaurants([]);
        this.villeSelection.emit([]);
        return;
      }

      const nomVille = this.ville.value.trim();
      this.derniereVilleRecherchee = nomVille;

      this.selectionService.definirVille(nomVille);
      this.selectionService.definirRestaurants(resultats);

      this.response.set(resultats);
      this.villeSelectionner.set(null);

      if (resultats.length > 0) {
        this.message = `${resultats.length} résultat(s) trouvé(s).`;
      } else {
        this.message =
          'Aucun résultat trouvé. Vérifiez le nom de la ville.';
      }

      this.villeSelection.emit(resultats);
    });
  }

  rechercheNominatim(): void {
    const nomVille = this.ville.value.trim();

    if (nomVille.length < 2 || this.ville.invalid) {
      this.message =
        'Veuillez saisir une ville valide (2 caractères minimum).';

      this.response.set([]);
      this.selectionService.definirRestaurants([]);
      this.villeSelection.emit([]);
      return;
    }

    this.rechercheDemandee$.next(nomVille);
  }

  selectionnerVille(restaurant: any): void {
    this.villeSelectionner.set(restaurant);
    this.message = `Restaurant localisé : ${restaurant.display_name}`;

 
    this.restaurantCible.emit(restaurant);
  }

  ngOnDestroy(): void {
    this.destruction$.next();
    this.destruction$.complete();
    this.rechercheDemandee$.complete();
  }
}
