import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, tap } from 'rxjs';
import { Country } from '../interfaces/country';
import { CacheStore } from '../interfaces/cache-store.interface';
import { Region } from './../interfaces/region.type';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private apiUrl = 'https://restcountries.com/v3.1'

  public cacheStorage: CacheStore = {
    byCapital:    {term: '', countries: [] },
    byCountries:  {term: '', countries: [] },
    byRegion:     {region: '', countries: [] },
  }

  constructor(private http: HttpClient) {
    this.loadFromLocalStorage();
   }

  private saveTolocalStorage(){
    localStorage.setItem('cacheStorage', JSON.stringify( this.cacheStorage ));
  }

  private loadFromLocalStorage(){
    if ( !localStorage.getItem('cacheStorage')) return;

    this.cacheStorage = JSON.parse( localStorage.getItem('cacheStorage')! );


  }

  private getCountriesRequest( url: string): Observable<Country[]>{
    return this.http.get<Country[]>( url )
    .pipe(
      catchError( () => of([])),
      //delay(2000),
    );
  }

  searchCountryByAlphaCode(code: string): Observable<Country | null>{
    const url = `${ this.apiUrl}/alpha/${ code }`;
    return this.http.get<Country[]>(url)
    .pipe(
      map( countries => countries.length > 0 ? countries[0]: null ),
      catchError( () => of(null))
    );
  }

  searchCapital( term: string ):Observable<Country[]>  {
    const url = `${ this.apiUrl}/capital/${ term }`;
    return this.getCountriesRequest(url)
    .pipe(
      tap( countries => this.cacheStorage.byCapital = { term, countries} ),
      tap( ()=> this.saveTolocalStorage() ),
    );
  }

  searchCountry( term: string ):Observable<Country[]>  {
    const url = `${ this.apiUrl}/name/${ term }`;
    return this.getCountriesRequest(url)
    .pipe(
      tap( countries => this.cacheStorage.byCountries = { term, countries} ),
      tap( ()=> this.saveTolocalStorage() ),
    );

  }

  searchRegion( term: Region ):Observable<Country[]>  {
    const url = `${ this.apiUrl}/region/${ term }`;
    return this.getCountriesRequest(url)
    .pipe(
      tap( countries => this.cacheStorage.byRegion = { region: term , countries } ),
      tap( ()=> this.saveTolocalStorage() ),
    );

  }
}
