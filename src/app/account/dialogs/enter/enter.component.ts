import { Component, OnInit, Pipe, Inject } from '@angular/core';
import { map, takeLast, flatMap, catchError } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AccountService } from '../../account.service';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: "./enter.component.html",
  styleUrls: ["./enter.component.css"]
})
export class EnterDialog {

  birds;
  enteredBirds;
  eBirds = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<EnterDialog>,
    private accountService: AccountService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.accountService.db.collection("library", ref => ref.where("userId", "==", this.accountService.user.id)).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          data['createdAt'] = data.createdAt.toDate();
          const id = a.payload.doc.id;
          return { ...data, id };
        })
      )
    ).subscribe(birds => {
      this.birds = birds;
    });
  }

    
  

  close() {
    this.dialogRef.close(this.enteredBirds);
  }
}