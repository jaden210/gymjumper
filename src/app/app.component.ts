import { Component, Inject } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AppService } from "./app.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from "@angular/material/bottom-sheet";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  open: boolean = false;
  body: HTMLElement;

  constructor(
    public router: Router,
    public appService: AppService,
    public auth: AngularFireAuth,
    private sheet: MatBottomSheet
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        //gtag("config", "UA-125391496-1", { page_path: event.url });
      }
      if (!(event instanceof NavigationEnd)) {
        return;
      }
      document.getElementById("scroll").scrollTop = 0;
    });
    this.auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        this.appService.loggedInStatus = "Account";
      }
    });
  }

  public navSheet() {
    this.sheet.open(NavigationSheet, {
      data: {
        loggedInStatus: this.appService.loggedInStatus
      }
    }).afterDismissed().subscribe((router: string) => {
      if (router) {
        router == 'signup' ? this.routeSignUp() : this.navRoute(router);
      }
    });
  }

  navRoute(link?) {
    this.open = false;
    this.router.navigate([link]);
  }
  
  goToBlog() {
    window.open("https://blog.GymJumper.com");
  }
  
  routeSignUp() {
    this.open = false;
    this.auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        this.router.navigate(["account"]);
      } else {
        this.router.navigate(['/sign-up']);
      }
    });
  }
}



@Component({
  selector: 'nav-sheet',
  templateUrl: 'nav-sheet.component.html',
  styleUrls: ["./app.component.css"],
})
export class NavigationSheet {

  loggedInStatus: boolean;

  constructor(private _bottomSheetRef: MatBottomSheetRef<NavigationSheet>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.loggedInStatus = this.data.loggedInStatus;
  }

  navRoute(action): void {
    this._bottomSheetRef.dismiss(action);
  }
}