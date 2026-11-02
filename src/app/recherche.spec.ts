import { TestBed } from '@angular/core/testing';
import { Recherche } from './recherche';

describe('Recherche', () => {
  let service: Recherche;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recherche);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
