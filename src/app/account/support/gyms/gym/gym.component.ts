import { Component, OnInit, Inject, Injector } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupportService } from '../../support.service';
import { Gym, AccountService } from 'src/app/account/account.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-gym',
  templateUrl: './gym.component.html',
  styleUrls: ['./gym.component.css']
})
export class GymComponent implements OnInit {

  loading: boolean = false;
  restrictions = [
    {name: "None", helpText: "", value: 0},
    {name: "Hours", helpText: "Hours allowed in a day", value: 2},
    {name: "Week", helpText: "Days allowed a week", value: 1},
    {name: "Month", helpText: "Days allowed a month", value: 1}
  ];

  constructor(
    public dialog: MatDialog,
    public appService: AppService,
    public accountService: AccountService,
    public supportService: SupportService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
  }

  upload(): void { 
    document.getElementById('upLogoUrl').click();
  }

  uploadGymLogoImage(event) {
    this.loading = true;
    let file = event.target.files[0];
    let filePath = this.supportService.gym.id + '/' + "logo-image";
    let ref = this.storage.ref(filePath);
    let task = this.storage.upload(filePath, file);
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          this.supportService.gym.logoUrl = url;
          this.accountService.db.collection("gyms").doc<Gym>(this.supportService.gym.id).update({logoUrl: url}).then(() => this.loading = false);
        });
      })
    ).subscribe();
  }

  addGym() {
    this.loading = true;
    if (this.supportService.gym.createdAt) { //edit
      this.supportService.db.doc(`gyms/${this.supportService.gym.id}`).update({...this.supportService.gym}).then(() => {
        this.supportService.gym = new Gym();
        this.supportService.makeGym = false;
        this.loading = false;
      })
    } else {
      console.log('hit');
      
      this.supportService.gym.id = this.supportService.gym.id ? this.supportService.gym.id.split(' ').join('-').toLowerCase() : this.supportService.gym.name.split(' ').join('-').toLowerCase();
      this.supportService.gym.createdAt = new Date();
      const addr = `${this.supportService.gym.street1} ${this.supportService.gym.city}, ${this.supportService.gym.state} ${this.supportService.gym.zip}`;
      this.appService.geocodeLocation(addr).subscribe(coords => {
        this.supportService.gym.latitude = coords.latitude;
        this.supportService.gym.longitude = coords.longitude;
        this.supportService.db.collection("gyms").doc(this.supportService.gym.id).set({...this.supportService.gym}).then(() => {
          this.supportService.gym = new Gym();
          this.supportService.makeGym = false;
          this.loading = false;
        }, error => console.error(error));
      });
    }
  }

  cancel() {
    this.supportService.gym = new Gym();
    this.supportService.makeGym = false;
  }

  deleteGym() {
    this.supportService.db.doc(`gyms/${this.supportService.gym.id}`).delete().then(() => {
      this.cancel();
    });
  }

  showQr() {
    let dialog = this.dialog.open(QRDialog, {data: this.supportService.gym});
  }

}

@Component({
  template: `
  <h2 mat-dialog-title>Print your Gym Code</h2>
  <mat-dialog-content>
  <qr-code [value] = "'https://gymjumper.io/visit/'+ data?.id" [size] = "500"></qr-code>
  </mat-dialog-content>
  <mat-dialog-actions style="margin-top:12px" align="end">
  <button mat-raised-button color="warn" (click)="close()">CLOSE</button>
  </mat-dialog-actions>
  `
})
export class QRDialog {
  constructor(
    public dialogRef: MatDialogRef<QRDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }
}