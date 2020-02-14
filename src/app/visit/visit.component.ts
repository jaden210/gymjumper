import { Component, OnInit } from "@angular/core";
import { AppService, User } from "../app.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { AccountService } from "../account/account.service";
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
  errorMessage: string = "loading";
  lastVisit: any = {
    createdAt: "never"
  };
  gymId: String;

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
    });
  }

findUserFromFirebaseAuth() {
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
            this.user = user;
            this.errorMessage = "";
            this.getLastUserVisit().subscribe(visit => {
              console.log(visit[0]);
              
              visit[0] ? this.lastVisit = visit[0] : null;
            });
          }
        });
    } else this.errorMessage = "no user logged into this device";
  });
}

getLastUserVisit() {
  return this.db.collection("visits", ref => ref
  .where("gymId", "==", this.gymId)
  .where("userId", "==", this.user.id)
  .orderBy("createdAt", "desc")
  .limit(1))
  .snapshotChanges()
  .pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data() as any;
      const id = a.payload.doc.id;
      data['createdAt'] = moment(data["createdAt"].toDate(), "YYYYMMDD").fromNow();
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
    this.router.navigate(["/account"]);
  })
}

dismiss() {
  this.router.navigate(["/account"]);
}

}