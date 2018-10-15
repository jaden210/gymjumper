import { Component, OnInit, Inject } from '@angular/core';
import { trigger, style, transition, animate } from "@angular/animations";
import { AccountService, User, Team, InviteToTeam } from './account.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { map } from "rxjs/operators";
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { AppService } from '../app.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  animations: [
    trigger("helper", [
      transition(":enter", [
        style({ transform: "translateX(-150%)", opacity: 0 }),
        animate("400ms ease-out", style({ transform: "translateX(0)", opacity: 1 }))
      ]),
      transition(":leave", [
        style({ transform: "translateX(0)", opacity: 1 }),
        animate("400ms ease-in", style({ transform: "translateX(-150%)", opacity: 0 }))
      ])
    ])
  ]
})
export class AccountComponent implements OnInit {

  constructor(
    public accountService: AccountService,
    public appService: AppService,
    private auth: AngularFireAuth,
    public router: Router,
    public dialog: MatDialog
  ) { 
    this.auth.auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        let userDoc = this.accountService.db.collection("user").doc(user.uid)
        userDoc.snapshotChanges().pipe(
          map((actions:any) => {
            let data = actions.payload.data();
            data['id'] = actions.payload.id;
            return data;
          })
        ).subscribe((user: User) => {
          this.accountService.userObservable.next(user);
          this.accountService.user = user;
          let invitedCollection = this.accountService.db.collection("invitation", ref => ref.where("status", "==", "invited").where("inviteEmail", "==", user.email.toLowerCase()));
            invitedCollection.snapshotChanges().pipe(
              map(actions => actions.map(a => {
                const data = a.payload.doc.data() as InviteToTeam;
                const id = a.payload.doc.id;
                return { id, ...data };
              }))
              ).subscribe(invitations => {
              if (invitations.length > 0) { // add them to their teams
                invitations.forEach((team: any) => {
                  user.teams[team.teamId] = team.isAdmin ? 1 : 0; // should probably document this so it isn't confusing
                  this.accountService.db.collection("invitation").doc(team.id).delete();
                });
                this.accountService.db.collection("user").doc(user.id).update({...user}).then(() => this.selectTeam());
              } else this.selectTeam();
            });
        });
        if (this.appService.removeFromInvite) {
          this.appService.removeFromInvite = false;
          let inviteCollection = this.accountService.db.collection("invitation", ref => ref.where("inviteEmail", "==", this.accountService.user.email.toLowerCase()));
          inviteCollection.snapshotChanges().pipe(
            map((actions:any) => {
              let data = actions.payload.data();
              data['id'] = actions.payload.id;
              return data;
            })
            ).subscribe(invitations => {
              invitations.forEach(invitation => {
                this.accountService.db.collection("invitation").doc(invitation.id).delete();
              });
            })
        }
      } else this.logout();
    });
  }
  
  selectTeam() {
    if (Object.keys(this.accountService.user.teams).length == 1) { // set the team and go home
      this.setActiveTeam(Object.keys(this.accountService.user.teams)[0]);
    } else { // pop the dialog asking which team to look at
      if (localStorage.getItem('teamId')) {
        this.setActiveTeam(localStorage.getItem('teamId'));
      } else {
        let teams = [];
        Object.keys(this.accountService.user.teams).forEach(key => {
          let teamDoc = this.accountService.db.collection("team").doc(key)
          teamDoc.valueChanges().subscribe(team => {
            team['id'] = key;
            teams.push(team);
          });
        })
        let dialog = this.dialog.open(TeamSelectDialog, {
          data: teams,
          disableClose: true
        });
        dialog.afterClosed().subscribe((teamId: any) => {
          if (teamId) {
            this.setActiveTeam(teamId);
          } else this.logout();
        });
      }
    }
  }
  
  setActiveTeam(teamId) {
    localStorage.setItem("teamId", teamId); // so we only ask once.
    let teamDoc = this.accountService.db.collection<Team>("team").doc(teamId);
    teamDoc.snapshotChanges().pipe(
      map((actions:any) => {
        let data = actions.payload.data();
        data['id'] = actions.payload.id;
        data['createdAt'] = data.createdAt.toDate();
        return data;
      })
      ).subscribe(team => {
        if (this.accountService.user.teams[team.id] == 0) { // they cant be here
          let dialog = this.dialog.open(NoAccessDialog, {
            disableClose: true
          });
          dialog.afterClosed().subscribe(() => this.logout());
        } else {
          this.accountService.aTeam = team;
          this.accountService.aTeamObservable.next(team);
          let membersCollection = this.accountService.db.collection<User>("user", ref => ref.where("teams." + team.id, ">=", 0));
          membersCollection.snapshotChanges().pipe(
            map(actions => actions.map(a => { //better way
              const data = a.payload.doc.data() as User;
              const id = a.payload.doc.id;
              return { id, ...data };
            }))
            ).subscribe(users => { // why is this being hit twice???????
              this.accountService.teamUsers = users;
              this.accountService.teamUsersObservable.next(users);
          });
        }
    });
  }

  ngOnInit() {
    
  }

  closeHelper() {
    this.accountService.showHelper = false;
  }

  submit() {
    this.accountService.feedback.name = "Thanks for your feedback!"
    setTimeout(() => {
      this.accountService.showFeedback = false;
      this.accountService.db.collection("feedback").add({
        origin: 'feeback helper',
        originPage: window.location.pathname,
        description: this.accountService.feedback.description,
        userId: this.accountService.user.id,
        userName: this.accountService.user.name,
        teamName: this.accountService.aTeam.name,
        createdAt: new Date()
      }).then(() => {
        this.accountService.feedback = this.accountService.helperProfiles.feedback;
      });
    }, 2000);
  }

  logout() {
    localStorage.removeItem('teamId');
    this.auth.auth.signOut().then(() => this.router.navigate(['/login']));
  }
}

@Component({
  selector: 'team-select-dialog',
  templateUrl: 'team-select-dialog.html',
  styleUrls: ['./account.component.css']
})
export class TeamSelectDialog {

  constructor(
    public dialogRef: MatDialogRef<TeamSelectDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  close(teamId?): void {
    this.dialogRef.close(teamId);
  }

}

@Component({
  selector: 'no-access-dialog',
  templateUrl: 'no-access-dialog.html',
  styleUrls: ['./account.component.css']
})
export class NoAccessDialog {

  constructor(
    public dialogRef: MatDialogRef<TeamSelectDialog>) {}

  close(): void {
    this.dialogRef.close();
  }

}