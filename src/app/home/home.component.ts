import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  username: string = "";
  isAuthenticated = false;
  promotions = [
    { title: '50% Off Flights!', description: 'Book now to get 50% off on select destinations.' },
    { title: 'Stay Longer, Save More!', description: 'Save up to 30% on hotels for extended stays.' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly oidcSecurityService: OidcSecurityService
    ) {
  }



  needsLogin: boolean | undefined;
  _userName: string = '';

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe((auth) => {
      if (auth.isAuthenticated) {
        this.isAuthenticated = true;
        if(auth?.idToken){
          const decodedToken : any = jwtDecode(auth.idToken);
          this.username = decodedToken['cognito:username'];
        }
      }
      console.log(auth);
    });
    this.needsLogin = !!this.route.snapshot.params['needsLogin'];
    //this.username = localStorage.getItem('username');
  }

  get userName(): string {
    return this._userName;
  }

  goToFlights(): void {
    this.router.navigate(['/flights']);
  }

  goToHotels(): void {
    this.router.navigate(['/hotels']);
  }


}
