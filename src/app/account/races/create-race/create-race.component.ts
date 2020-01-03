import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { AccountService } from '../../account.service';
import { Race } from '../race/race.component';

@Component({
  selector: 'create-race',
  templateUrl: './create-race.component.html',
  styleUrls: ['./create-race.component.css']
})
export class CreateRaceComponent implements OnInit {

  race: Race;
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
    this.accountService.race ? this.race = this.accountService.race : this.race = new Race();
  }

  submit() {
    this.loading = true;
    this.race.createdAt = new Date();
    this.race.creatorId = this.accountService.user.id;
    this.accountService.db.collection("races").add({...this.race}).then(doc => {
      this.accountService.race = null;
      this.accountService.makeRace = false;
      this.loading = false;
    }, error => console.error(error));
  }

  cancel() {
    this.accountService.race = null;
    this.accountService.makeRace = false;
  }

  deleteRace() {
    this.accountService.db.doc(`races/${this.race.id}`).delete().then(() => {
      this.cancel();
    });
  }

}

