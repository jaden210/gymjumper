import { Component, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { AccountService } from '../../account.service';
import { EnterDialog } from '../../dialogs/enter/enter.component';

@Component({
  selector: 'race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.css']
})
export class RaceComponent implements OnInit {

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
    this.race = this.accountService.race;
  }

  enterRace() {
    let dialog = this.dialog.open(EnterDialog, {
      data: this.race,
      disableClose: true
    });
    dialog.afterClosed().subscribe(enteredBirds => {
      this.race.birds.push(enteredBirds);
      this.accountService.db.doc(`races/${this.race.id}`).update({...this.race}).then(() => {
        this.cancel();
      })
    })
  }

  cancel() {
    this.accountService.race = null;
    this.accountService.makeRace = false;
  }

}


export class Race {
  id?: string;
  name: string;
  createdAt: any;
  raceType: string;
  creatorId;
  birds?;
  startedAt?;
  startLocation?;
  info?;
  content?;
}

