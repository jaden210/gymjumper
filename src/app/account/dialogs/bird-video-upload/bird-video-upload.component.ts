import { Component, OnInit, Pipe, Inject } from '@angular/core';
import { map, takeLast, flatMap, catchError } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  templateUrl: "./bird-video-upload.component.html",
  styleUrls: ["./bird-video-upload.component.css"]
})
export class BirdVideoDialog {
  previewImg;
  image;
  uploadProgress;

  constructor(
    public dialogRef: MatDialogRef<BirdVideoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: AngularFireStorage
  ) {
  }

  public getVideo(): void {
    document.getElementById("image-input").click();
  }

  public setVideo(event): void {
    // callback from view
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.previewImg = (<FileReader>event.target).result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.image = event.target.files[0];
      this.uploadVideo().subscribe(videoUrl => {
        this.data.videoUrl = videoUrl;
      })
    } else {
      this.previewImg = undefined; // broken image
      this.image = undefined;
    }
  }

  public uploadVideo(): Observable<string> {
    const date = new Date().getTime();
    let filePath = `BirdVideos/${date}`;
    let ref = this.storage.ref(filePath);
    let task = this.storage.upload(filePath, this.image);
    this.uploadProgress = task.snapshotChanges()
    .pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));
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
    this.dialogRef.close(this.data);
  }
}