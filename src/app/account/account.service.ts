import { Injectable, Component, Inject } from "@angular/core";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { map, debounceTime } from "rxjs/operators";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  MatSnackBar,
  MatSnackBarRef
} from "@angular/material/snack-bar";
import {
  MatSidenav
} from "@angular/material/sidenav";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AngularFireStorage } from "@angular/fire/storage";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class AccountService {
  private sidenav: MatSidenav;
  userObservable: BehaviorSubject<any> = new BehaviorSubject(null);
  gymObservable: BehaviorSubject<any> = new BehaviorSubject(null);
  user: User = new User();
  bShowProfile: boolean = false; // template var
  aGym: Gym = new Gym();
  visitedGyms: any = {};
  visits;

  constructor(
    public db: AngularFirestore,
    private auth: AngularFireAuth,
    public storage: AngularFireStorage,
    public dialog: MatDialog,
    public router: Router,
    public snackbar: MatSnackBar,
  ) {}
  

  checkFreeTrial(team): void {
    // if (!team.cardToken) {
    //   this.trialDaysLeft =
    //     30 - moment().diff(this.aTeam.createdAt, "days") < 0
    //       ? 0
    //       : 30 - moment().diff(this.aTeam.createdAt, "days");
    //   let shouldOpen: boolean = false;
    //   if (this.trialDaysLeft == 28) shouldOpen = true;
    //   if (this.trialDaysLeft == 20) shouldOpen = true;
    //   if (this.trialDaysLeft == 10) shouldOpen = true;
    //   if (this.trialDaysLeft <= 5) shouldOpen = true;
    //   if (shouldOpen) {
    //     this.isTrialVersion = true;
    //     this.trialSnackbar = this.snackbar.open(
    //       `${this.trialDaysLeft} days left in your free trial`,
    //       "enter billing info",
    //       {
    //         horizontalPosition: "right"
    //       }
    //     );
    //     this.trialSnackbar.onAction().subscribe(() => {
    //       this.router.navigate(["account/account"]);
    //     });
    //   }
    // } else {
    //   this.isTrialVersion = false;
    //   this.closeSnackbar();
    // }
  }

  logout(): void {
    this.auth.signOut().then(() => {
      this.router.navigate(["/home"]); 
      // bug that doesnt update sign in / account button
    });
  }

  public setSidenav(sidenav: MatSidenav) {
    this.sidenav = sidenav;
  }

  public toggle(): void {
    this.sidenav.toggle();
  }

}

export class User {
  email: string;
  isDev: boolean = false;
  username?: string;
  phone?: string;
  accountType?: string;
  gymId?: string;
  profileUrl?: string;
  name?: string;
  id?: string;
  stripeSubscriptionId: string;
  stripeInvoice: any;
  stripePlanId: string;
  cardToken: any;
  stripeInvoicesRetrievedAt?: any;
  stripeCustomerId?: any;
  secondUserEmail?: string;
}

export class Activity {
  id: string;
  createdAt: Date;
  gymId: string;
  gymName: string;
}

export class Gym {
  id?: string;
  isApproved: boolean = false;
  createdAt: any;
  name: string;
  logoUrl?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  rate?: string;
  latitude?: number;
  longitude?: number;
  info?: string;
  restrictionText?: string;
  restrictionCount?: number;
  isActive: boolean = false;
}