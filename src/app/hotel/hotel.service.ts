import { Hotel } from './hotel';
import { HotelFilter } from './hotel-filter';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const headers = new HttpHeaders().set('Accept', 'application/json');

@Injectable()
export class HotelService {
  hotelList: Hotel[] = [];
  API = environment.HOTELS_API_URL;

  constructor(private http: HttpClient) {
  }

  findById(id: string): Observable<Hotel> {
    const url = `${this.API}?id=${id}`;
    const params = {};
    return this.http.get<Hotel>(url, {params, headers});
  }

  load(filter: HotelFilter): void {
    this.find(filter).subscribe({
      next: result => {
        this.hotelList = result;
      },
      error: err => {
        console.error('error loading', err);
      }
    });
  }

  find(filter: HotelFilter): Observable<Hotel[]> {
    const params = {
      'city': filter.city,
    };

    return this.http.get<Hotel[]>(this.API, {params, headers});
  }

  save(entity: Hotel): Observable<Hotel> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = this.API;
      //params = new HttpParams().set('ID', entity.id.toString());
      return this.http.post<Hotel>(url, entity, {headers, params});
    } else {
      url = this.API;
      return this.http.post<Hotel>(url, entity, {headers, params});
    }
  }

  delete(entity: Hotel): Observable<Hotel> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = `${this.API}?id=${entity.id}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.delete<Hotel>(url, {headers, params});
    }
    return EMPTY;
  }
}

