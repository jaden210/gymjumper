import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { BirdPhotoDialog } from '../../dialogs/bird-photo-upload/bird-photo-upload.component';
import { BirdVideoDialog } from '../../dialogs/bird-video-upload/bird-video-upload.component';
import { AccountService } from '../../account.service';

@Component({
  selector: 'bird',
  templateUrl: './bird.component.html',
  styleUrls: ['./bird.component.css']
})
export class BirdComponent implements OnInit {

  bird: Blog;
  loading: boolean = false;
  slugError: string;

  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "calc(100vh - 360px)",
    minHeight: "100px",
    placeholder: "content *",
    translate: "yes"
  };

  constructor(
    public dialog: MatDialog,
    public accountService: AccountService
  ) { }

  ngOnInit() {
    this.accountService.bird ? this.bird = this.accountService.bird : this.bird = new Blog();
  }

  submit() {
    this.slugError = '';
    this.loading = true;
    console.log(this.bird);
    
    if (this.bird.createdAt) { //edit
      this.accountService.db.doc(`library/${this.bird.id}`).update({...this.bird}).then(() => {
        this.accountService.bird = new Blog();
        this.accountService.makeBird = false;
        this.loading = false;
      })
    } else {
      this.bird.id = this.bird.id ? this.bird.id.split(' ').join('-').toLowerCase() : this.bird.name.split(' ').join('-').toLowerCase();
      this.accountService.db.doc(`library/${this.bird.id}`).valueChanges().subscribe(bird => {
        if (!bird) {
          this.bird.createdAt = new Date();
          this.bird.userId = this.accountService.user.id;
          this.accountService.db.collection("library").doc(this.bird.id).set({...this.bird}).then(() => {
            this.accountService.bird = new Blog();
            this.accountService.makeBird = false;
            this.loading = false;
          }, error => console.error(error));
        } else {
          this.slugError = "That name is already taken";
          this.loading = false;
        }
      })
    }
  }

  birdPhoto() {
    let dialog = this.dialog.open(BirdPhotoDialog, {
      data: this.bird,
      disableClose: true
    });
    dialog.afterClosed().subscribe(data => {
      this.bird = data;
    })
  }

  birdVideo() {
    this.dialog.open(BirdVideoDialog, {
      data: this.bird,
      disableClose: true
    });
  }

  cancel() {
    this.accountService.bird = new Blog();
    this.accountService.makeBird = false;
  }

  deleteBird() {
    this.accountService.db.doc(`library/${this.bird.id}`).delete().then(() => {
      this.cancel();
    });
  }

}


export class Blog {
  content: string;
  contentEs: string;
  createdAt: any;
  name: string;
  nameEs: string;
  id?: string;
  userId: string;
  imageUrl: string;
}

