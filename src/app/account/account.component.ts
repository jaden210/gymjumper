import { Component, Inject, ViewChild, AfterViewInit } from "@angular/core";
import { AccountService, User, Gym } from "./account.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
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
    this.auth.onAuthStateChanged(user => {
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
              this.getUserVisits(user);
              if (!user.cardToken) this.checkForBuddyPass();
            }
          });
      } else this.accountService.logout();
    });
  }

  private checkForBuddyPass() {
    this.accountService.db.collection("user", ref => ref.where("secondUserEmail", "==", this.accountService.user.email)).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    ).subscribe(users => {
      if (users && users.length) {
        this.accountService.db.doc(`user/${this.accountService.user.id}`)
        .update(
          { cardToken: users[0].id,
            stripePlanId: 'pro-plan-plus-one',
            secondUserEmail: users[0].email
          }).then(result => {
          console.log('done!');
        });
      }
    });
  }

  ngAfterViewInit() {
    this.accountService.setSidenav(this.sidenav);
  }

  getUserVisits(user) {
    this.accountService.db.collection(`visits`, ref => ref.where("userId", "==", this.accountService.user.id).orderBy("createdAt", "desc")).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data['createdAt'] = moment(data.createdAt.toDate(), "YYYYMMDD").fromNow();
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    ).subscribe(visits => {
      let result = {};
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
              this.accountService.visitedGyms[id] = {data, id};
            }))
            : of(null)
          })
        ).subscribe((gyms: Gym[]) => {
          console.log(this.accountService.visitedGyms);
          console.log(this.accountService.visits);
          
          
        });
/*       visits.forEach(visit => {
        let gymObs = this.accountService.db.doc(`gyms/${visit.gymId}`);
        this.accountService.visitedGyms.findIndex(gym => gym.id == visit.gymId) == -1 ?
        gymObs.snapshotChanges()
        .pipe(
          map((actions: any) => {
            let data = actions.payload.data() || {};
            data["id"] = actions.payload.id;
            return data;
          })
        )
        .subscribe((gym: Gym) => {
          this.accountService.visitedGyms.push(gym);
          console.log(this.accountService.visitedGyms);
          
        }) : null;
      });
 */    });

  }
}
