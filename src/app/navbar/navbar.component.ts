import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'navbar-cmp',
  templateUrl: 'navbar.component.html'
})
export class NavbarComponent implements OnInit {

  private sidebarVisible: boolean = false;
  username: string = "";
  usernameInitials: string = "";
  configuration$ = this.oidcSecurityService.getConfiguration();

  userData$ = this.oidcSecurityService.userData$;

  isAuthenticated = false;

  constructor(private readonly oidcSecurityService: OidcSecurityService) {
  }

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe((auth) => {
      if (auth.isAuthenticated) {
        if(auth?.idToken){
          const decodedToken : any = jwtDecode(auth.idToken);
          this.username = decodedToken['cognito:username'];
          localStorage.setItem('username', this.username);
          this.usernameInitials = this.getInitials(this.username);
        }
        else{
          this.loadUserName(auth);
        }
        this.isAuthenticated = true;
      }
      else{
        this.username = "";
        this.usernameInitials = "";
      }
      console.log(auth);
    });
    
  }

  sidebarToggle() {
    const body = document.getElementsByTagName('body')[0];

    if (!this.sidebarVisible) {
      body.classList.add('nav-open');
      this.sidebarVisible = true;
      console.log('making sidebar visible...');
    } else {
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }

  private loadUserName(auth: any): void {

    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      if (!userData && !auth?.idToken) {
        console.error('UserData is null. Possible issues:');
        console.error('- User is not authenticated.');
        console.error('- Claims are not included in the ID token.');
        console.error('- OIDC configuration issue.');
      } else{
        console.log('UserData:', userData);
        const decodedToken : any = jwtDecode(auth.idToken);

        this.username = userData.username || decodedToken['cognito:username'] || userData.preferred_username || null;
        localStorage.setItem('username', this.username ? this.username : "");
        if (this.username) {
          this.usernameInitials = this.getInitials(this.username);
        }
      }
    });
  }
  
  login(): void {
    //this._userName = 'Max';
    this.oidcSecurityService.authorize();
    //this.userName = this.userData$['username'];
    
  }

  logout(): void {
    //this._userName = '';
    if (window.sessionStorage) {
      localStorage.removeItem('username');
      window.sessionStorage.clear();
    }
    const clientId = environment.CLIENT_ID;
    const domain = environment.DOMAIN;
    window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${window.location.origin}/logout`; 
  }

  private getInitials(name: string): string {
    return name
      .split(' ') 
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }
}
