import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatDialog } from "@angular/material/dialog";
import { VideoDialogComponent } from "./video-dialog/video-dialog.component";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { MapsAPILoader } from "@agm/core";

declare var google: any;

@Injectable({
  providedIn: "root"
})
export class AppService {
  /* Set on sign-up-page */
  email: string;
  /* Checking for invites sets this here */
  invites: any[];

  isUser: boolean = false; // decides if a user has logged in before
  loggedInStatus: string = "Sign in"; // decides if a user is logged in
  firstTimeUser: boolean = false; // lets the system show new member dialog
  toolbarShadow: boolean = true;


  geoCoder;

  constructor(
    public db: AngularFirestore,
    public dialog: MatDialog,
    public auth: AngularFireAuth,
    private router: Router,
    private map: MapsAPILoader
  ) {
    this.map.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
    })
  }

  watchVideo() {
    let dialog = this.dialog.open(VideoDialogComponent);
  }

  /* When they put in their email address check it first */
  checkForExistingUser(email): Promise<boolean> {
    return (
      this.auth
        .fetchSignInMethodsForEmail(email)
        /* If length > 0, not new else new user */
        .then(
          data => {
            return data.length ? true : false;
          },
          error => {
            throw error;
          }
        )
    );
  }

  /* From the create account button, if all clear route to get started */
  getInvites(email): Observable<any> {
    return this.db
      .collection("invitation", ref =>
        ref.where("inviteEmail", "==", email.toLowerCase())
      )
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { data, id };
          })
        ),
        tap(invites => (this.invites = invites))
      );
  }

  getGymLocations(): Observable<any> {
    return this.db.collection('gyms', ref => ref.where("isActive", "==", true)).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data['createdAt'] = data.createdAt.toDate();
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    );
  }

  geocodeLocation(location: string): Observable<any> {
    if (!this.geoCoder) this.geoCoder = new google.maps.Geocoder();
    return new Observable((observer) => {
      this.geoCoder.geocode({address: location}, (result, status) => {
        if (status === 'OK') {
          const geometry = result[0].geometry.location;
          const coordinates = {latitude: geometry.lat(), longitude: geometry.lng()};  
          observer.next(coordinates);
        } else {
          observer.error('Location could not be geocoded');
        }
      });
    });
  }
}

export class User {
  // also in account service
  id?: string;
  name?: string;
  email: string;
  profileUrl?: string;
  username?: string;
  phone?: string;
  accountType?: string;
  teams?: any[];
}

/*
to push a tag:

declare var gtag: Function;


gtag("event", "video_watched", {
      event_category: "video",
      event_label: "video"
    });
*/
