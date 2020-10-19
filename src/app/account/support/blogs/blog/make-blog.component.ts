import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SupportService } from '../../support.service';
import { BlogPhotoDialog } from '../../dialogs/blog-photo-upload/blog-photo-upload.component';
import { BlogVideoDialog } from '../../dialogs/blog-video-upload/blog-video-upload.component';
import { BlogMetaDescriptionDialog } from '../../dialogs/blog-meta-description/blog-meta-description.component';
import { BlogTopicDialog } from '../../dialogs/blog-topic-generator/blog-topic-generator.component';

@Component({
  selector: 'app-make-blog',
  templateUrl: './make-blog.component.html',
  styleUrls: ['./make-blog.component.css']
})
export class BlogComponent implements OnInit {

  blog: Blog;
  topics: Observable<any>;
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
    private supportService: SupportService
  ) { }

  ngOnInit() {
    this.supportService.blog ? this.blog = this.supportService.blog : this.blog = new Blog();
    this.topics = this.supportService.getBlogTopics();
  }

  submit() {
    this.slugError = '';
    this.loading = true;
    if (this.blog.createdAt) { //edit
      this.supportService.db.doc(`blog/${this.blog.id}`).update({...this.blog}).then(() => {
        this.supportService.blog = new Blog();
        this.supportService.makeBlog = false;
        this.loading = false;
      })
    } else {
      this.blog.id = this.blog.id ? this.blog.id.split(' ').join('-').toLowerCase() : this.blog.name.split(' ').join('-').toLowerCase();
      this.supportService.db.doc(`blog/${this.blog.id}`).valueChanges().subscribe(blog => {
        if (!blog) {
          this.blog.createdAt = new Date();
          this.supportService.db.collection("blog").doc(this.blog.id).set({...this.blog}).then(() => {
            this.supportService.blog = new Blog();
            this.supportService.makeBlog = false;
            this.loading = false;
          }, error => console.error(error));
        } else {
          this.slugError = "That name is already taken";
          this.loading = false;
        }
      })
    }
  }

  blogPhoto() {
    this.dialog.open(BlogPhotoDialog, {
      data: this.blog,
      disableClose: true
    });
  }

  blogVideo() {
    this.dialog.open(BlogVideoDialog, {
      data: this.blog,
      disableClose: true
    });
  }

  blogMetaDescription() {
    this.dialog.open(BlogMetaDescriptionDialog, {
      data: this.blog,
      disableClose: true
    });
  }

  newTopic() {
    let dialog = this.dialog.open(BlogTopicDialog)
    dialog.afterClosed().subscribe(data => {
      if (data) {
        let blogTopic = {
          name: data.name,
          createdAt: new Date(),
        }
        let id = data.name.split(' ').join('-').toLowerCase();
        this.supportService.db.collection("blog-topic").add({...blogTopic}).then(() => {
          this.blog.topic = blogTopic.name;
        }, error => {
          console.error("Topic name is already created.");
          this.blog.topic = blogTopic.name;
        });
      }
    })
  }

  cancel() {
    this.supportService.blog = new Blog();
    this.supportService.makeBlog = false;
  }

  deleteBlog() {
    this.supportService.db.doc(`blog/${this.blog.id}`).delete().then(() => {
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
  topic: string;
  id?: string;
  imageUrl: string;
}

