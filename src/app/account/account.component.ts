import { Component, Inject, ViewChild, AfterViewInit } from "@angular/core";
import { AccountService, User, Gym } from "./account.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatDialog, MatSidenav } from "@angular/material";
import { AppService } from "../app.service";

import * as moment from "moment";
import { combineLatest, of, concat } from "rxjs";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.css"]
})
export class AccountComponent implements AfterViewInit {
  @ViewChild('sidenav') public sidenav: MatSidenav;
  bShowAccountInfo: boolean = false; // template var
  helperContrast: boolean = false; // template var

  constructor(
    public accountService: AccountService,
    public appService: AppService,
    private auth: AngularFireAuth,
    public router: Router,
    public dialog: MatDialog
  ) {
    this.auth.auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        let userDoc = this.accountService.db.collection("user").doc(user.uid);
        userDoc
          .snapshotChanges()
          .pipe(
            map((actions: any) => {
              let data = actions.payload.data() || {};
              data["id"] = actions.payload.id;
              return data;
            })
          )
          .subscribe((user: User) => {
            if (user.id) {
              this.accountService.user = user;
              this.accountService.userObservable.next(user);
              this.accountService.getLibrary().subscribe(birds => {
                this.accountService.library = birds;
              });
              this.accountService.getRaces().subscribe(races => {
                this.accountService.races = races;
              });
            }
          });
      } else this.accountService.logout();
    });
  }

  ngAfterViewInit() {
    this.accountService.setSidenav(this.sidenav);
  }

  getUserVisits(user) {
    this.accountService.db.collection(`visits`, ref => ref.where("userId", "==", this.accountService.user.id)).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data['createdAt'] = moment(data.createdAt.toDate(), "YYYYMMDD").fromNow();
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    ).subscribe(visits => {
      this.accountService.visits = visits;
        combineLatest(
          visits.map(visit => {
            return  !this.accountService.visitedGyms[visit.gymId]
            ? this.accountService.db
            .doc(`gyms/${visit.gymId}`)
            .snapshotChanges()
            .pipe(map(result => {
              const data = result.payload.data() || {};
              const id = result.payload.id;
              this.accountService.visitedGyms[id] = {...data, id};
            }))
            : of(null)
          })
        ).subscribe((gyms: Gym[]) => {
          console.log(this.accountService.visitedGyms);
        });
    });
  }

  getGymVisits(gym) { // TODO: Limit to one monthish
    this.accountService.db.collection("visits", ref => ref.where("gymId", "==", gym.id)).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data['createdAt'] = moment(data.createdAt.toDate(), "YYYYMMDD").fromNow();
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    ).subscribe(gymVisits => {
      gymVisits.forEach(visit => { //visitCount
        visit.visitCount = gymVisits.reduce((acc, cur) => cur.userId === visit.userId ? ++acc : acc, 0);
      });
      this.accountService.gymVisits = gymVisits;
      combineLatest(
        gymVisits.map(visit => {
          return  !this.accountService.visitedUsers[visit.userId]
          ? this.accountService.db
          .doc(`user/${visit.userId}`)
          .snapshotChanges()
          .pipe(map(result => {
            const data = result.payload.data() || {};
            const id = result.payload.id;
            this.accountService.visitedUsers[id] = {...data, id};
          }))
          : of(null)
        })
      ).subscribe((users: Gym[]) => {
        console.log(this.accountService.visitedUsers);
      });
    });
  }
}
