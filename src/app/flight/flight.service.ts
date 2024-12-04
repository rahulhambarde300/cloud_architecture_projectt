import { Flight } from './flight';
import { FlightFilter } from './flight-filter';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class FlightService {
  flightList: Flight[] = [];
  API = environment.FLIGHTS_API_URL;
  EMAIL_API = environment.EMAIL_API_URL;

  constructor(private http: HttpClient) {
  }

  findById(id: string): Observable<Flight> {
    const url = `${this.API}?id=${id}`;
    const params = { };
    const headers = new HttpHeaders().set('Accept', 'application/json');
    return this.http.get<Flight>(url, {params, headers});
  }

  load(filter: FlightFilter): void {
    this.find(filter).subscribe(result => {
        this.flightList = result;
      },
      err => {
        console.error('error loading', err);
      }
    );
  }

  find(filter: FlightFilter): Observable<Flight[]> {
    const url = this.API;
    const headers = new HttpHeaders().set('Accept', 'application/json');

    const params = {
      'from': filter.from,
      'to': filter.to,
    };

    return this.http.get<Flight[]>(url, {params, headers});
  }

  save(entity: Flight): Observable<Flight> {
    let params = new HttpParams();
    let url = '';
    const headers = new HttpHeaders().set('content-type', 'application/json');
    // headers.append('Access-Control-Allow-Origin', '*');
    url = this.API;
    return this.http.post<Flight>(url, entity, { headers }).pipe(
      tap((response) => {
        const lambdaUrl = this.EMAIL_API;
        const notificationPayload = {
          from: entity.from,
          to: entity.to,
          date: entity.date
        };
  
        this.http.post(lambdaUrl, notificationPayload).subscribe({
          next: () => console.log('Notification sent successfully'),
          error: (err) => console.error('Failed to send notification', err),
        });
      }),
      catchError((error) => {
        console.error('Error occurred while saving flight:', error);
        return throwError(error);
      })
    );
  }

  delete(entity: Flight): Observable<Flight> {
    let params = new HttpParams();
    let url = '';
    const headers = new HttpHeaders().set('content-type', 'application/json');
    if (entity.id) {
      url = `${this.API}?id=${entity.id}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.delete<Flight>(url, {headers, params});
    }
    return EMPTY;
  }
}

