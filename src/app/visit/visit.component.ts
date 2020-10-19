import { Component, OnInit } from "@angular/core";
import { AppService, User } from "../app.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { AccountService, Gym } from "../account/account.service";
import { map, tap } from "rxjs/operators";
import { Subscription } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import * as moment from "moment";

@Component({
  selector: "app-visit",
  templateUrl: "./visit.component.html",
  styleUrls: ["./visit.component.css"]
})
export class VisitComponent implements OnInit {

  user: User;
  gym: Gym;
  errorMessage: string = "loading";
  lastVisit: any = {
    createdAt: "never"
  };
  gymId: String;
  show: boolean = false;
  login: boolean = false;
  complete: boolean = false;
  restrictedAccess: boolean = false;

  constructor(
    public appService: AppService,
    public accountService: AccountService,
    public auth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    this.getGymId();
    this.findUserFromFirebaseAuth();
  }

  getGymId() {
    this.route.params.subscribe(params => {
      this.gymId = params['id'];
      this.appService.db.doc(`gyms/${this.gymId}`).valueChanges().subscribe((gym: Gym) => {
        if (gym) {
          this.gym = gym
        } else {
          this.errorMessage = "No gym found";
          this.router.navigate(['home']);
        }
      })
    });
  }

  findUserFromFirebaseAuth() {
    this.auth.authState.subscribe(state => {
      if (state && state.uid) {
        let userDoc = this.accountService.db.collection("user").doc(state.uid);
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
              this.user = user;
              this.errorMessage = "";
              this.login = false;
              this.show = true;
              this.getLastUserVisit().subscribe(visits => {
                visits[0] ? this.lastVisit = visits[0] : null;
                if (this.gym.restrictionCount) {
                  this.restrictedAccess = visits.filter(visit => visit.createdAt <= moment().subtract(30, 'days')).length >= this.gym.restrictionCount;
                }
              });
            }
          });
      } else {
        this.errorMessage = "no user logged into this device";
        this.login = true;
      }
    })
  }

  getLastUserVisit() {
    return this.db.collection("visits", ref => ref
    .where("gymId", "==", this.gymId)
    .where("userId", "==", this.user.id)
    .orderBy("createdAt", "desc"))
    .snapshotChanges()
    .pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        data['createdAt'] = moment(data["createdAt"].toDate(), "YYYYMMDD");
        return { ...data, id };
      })
    ));
  }

admitVisit() {
  this.db.collection("visits").add({
    createdAt: new Date(),
    gymId: this.gymId,
    userId: this.user.id,
    userName: this.user.name
  }).then(visit => {
    this.complete = true;
  });
}

dismiss() {
  this.router.navigate(["/account"]);
}

}