import { Component, OnInit, Pipe, Inject } from '@angular/core';
import { map, takeLast, flatMap, catchError } from "rxjs/operators";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  templateUrl: "./blog-topic-generator.component.html",
  styleUrls: ["./blog-topic-generator.component.css"]
})
export class BlogTopicDialog {
  topic = new BlogTopic();
  constructor(
    public dialogRef: MatDialogRef<BlogTopicDialog>
  ) {}

  close(topic) {
    this.dialogRef.close(topic);
  }
}

export class BlogTopic {
  name?: string;
  createdAt?: any;
}