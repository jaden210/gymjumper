import { Component, OnInit, Pipe, Inject } from '@angular/core';
import { map, takeLast, flatMap, catchError } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';


@Component({
  templateUrl: "./blog-meta-description.component.html",
  styleUrls: ["./blog-meta-description.component.css"]
})
export class BlogMetaDescriptionDialog {
  constructor(
    public dialogRef: MatDialogRef<BlogMetaDescriptionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  close() {
    this.dialogRef.close(this.data);
  }
}