import { Component, OnInit, Pipe, Inject } from '@angular/core';
import { map, takeLast, flatMap, catchError } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  templateUrl: "./bird-photo-upload.component.html",
  styleUrls: ["./bird-photo-upload.component.css"]
})
export class BirdPhotoDialog {
  previewImg;
  image;

  constructor(
    public dialogRef: MatDialogRef<BirdPhotoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: AngularFireStorage
  ) {
    this.previewImg = this.data.imageUrl || null;
  }

  public getImage(): void {
    document.getElementById("image-input").click();
  }

  public setImage(event): void {
    // callback from view
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.previewImg = (<FileReader>event.target).result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.image = event.target.files[0];
    } else {
      this.previewImg = undefined; // broken image
      this.image = undefined;
    }
  }

  public uploadImage(): Observable<string> {
    const date = new Date().getTime();
    let filePath = `BirdImages/${date}`;
    let ref = this.storage.ref(filePath);
    let task = this.storage.upload(filePath, this.image);
    return task.snapshotChanges().pipe(
      takeLast(1),
      flatMap(() => ref.getDownloadURL()),
      catchError(error => {
        console.error(`Error saving image for topic`, error);
        return (error);
      })
    );
  }

  close() {
    this.uploadImage().subscribe(imageUrl => {
      this.data.imageUrl = imageUrl;
    })
    this.dialogRef.close(this.data);
  }
}