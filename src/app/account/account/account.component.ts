import { Component, OnInit , OnDestroy, ViewChild, AfterViewInit} from '@angular/core';
import { AccountService, User, Gym } from '../account.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { map, finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ScanDialog } from '../scan-dialog/scan-dialog.component';

import { environment } from "src/environments/environment";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  showGym: boolean = false;
  loading: boolean = false;
  selectedTab;
  private _stripe: any;
  private _elements: any;
  private _card: any;

  constructor(
    private appService: AppService,
    public accountService: AccountService,
    private storage: AngularFireStorage,
    public auth: AngularFireAuth,
    public router: Router,
    public route: ActivatedRoute,
    public dialog: MatDialog
  ) { }


  ngOnInit() {
  }

  upload(profile): void { // this will call the file input from our custom button
    profile ?
    document.getElementById('upProfileUrl').click() :
    document.getElementById('upLogoUrl').click();
  }

  uploadProfileImage(event) {
    this.loading = true;
    let file = event.target.files[0];
    let filePath = `users/${this.accountService.user.id}`;
    let ref = this.storage.ref(filePath);
    let task = this.storage.upload(filePath, file);
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          this.accountService.db.collection("user").doc<User>(this.accountService.user.id).update({profileUrl: url}).then(() => this.loading = false);
        });
      })
    ).subscribe();
  }

  saveProfile() {
    this.accountService.db.collection("user").doc(this.accountService.user.id).update({...this.accountService.user});
  }

  deleteAccount() {
    let dialog = this.dialog.open(DeleteAccountDialog);
    dialog.afterClosed().subscribe(shouldDelete => {
      if (shouldDelete) { // disable the user
        let date = new Date();
        this.accountService.db.collection("support").add({
          createdAt: date,
          email: "internal",
          body: `${this.accountService.user.name} has been deleted on ${date}. ${this.accountService.user.name} can be reached at ${this.accountService.user.phone} 
          or ${this.accountService.user.email}. Pause the Stripe account for userId ${this.accountService.user.id}.`
        });
        this.accountService.db.collection("user").doc(this.accountService.user.id).update({
          disabled: true,
          disabledAt: date
        }).then(() => {
          window.location.reload(); // easiest way to repull the data
        }).catch(error => console.error("cannot delete account at this time, contact us for more help. " + error));
      }
    });
  }

  ngOnDestroy() {
  }

}

@Component({
  template: `
  <h2 mat-dialog-title>Are you sure?</h2>
  <mat-dialog-content>By clicking DELETE, you are removing access and making your account inactive.<br>
  We'll hold your data for 30 days, and then it will be removed from our system.</mat-dialog-content>
  <mat-dialog-actions style="margin-top:12px" align="end"><button mat-button color="primary" style="margin-right:8px" (click)="close(false)">CANCEL</button>
  <button mat-raised-button color="warn" (click)="close(true)">DELETE</button>
  </mat-dialog-actions>
  `
})
export class DeleteAccountDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteAccountDialog>
  ) {}

  close(shouldDelete) {
    this.dialogRef.close(shouldDelete);
  }
}