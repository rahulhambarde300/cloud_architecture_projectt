import {Component, OnInit} from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
  isAuthenticated = false;
  
  constructor(private readonly oidcSecurityService: OidcSecurityService) {
  }

  ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe((auth) => {
      if (auth.isAuthenticated) {
        this.isAuthenticated = true;
      }
      console.log(auth);
    });
    
  }

}
