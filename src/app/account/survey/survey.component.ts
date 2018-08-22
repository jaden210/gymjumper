import { Component, OnInit } from '@angular/core';
import { AccountService, Survey } from '../account.service';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {

  surveys: Survey[];
  aSurvey: Survey = new Survey();
  create: boolean = false; // template variable

  week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    public accountService: AccountService,
    public snackbar: MatSnackBar
  ) {
    this.accountService.helper = this.accountService.helperProfiles.survey;
    this.accountService.aTeamObservable.subscribe(team => {
      if (team) {
        let surveyCollection = this.accountService.db.collection<Survey[]>("survey", ref => ref.where("teamId", "==", this.accountService.aTeam.id).orderBy("createdAt", "desc"));
        surveyCollection.snapshotChanges().pipe(
          map(actions => {
            return actions.map(a => {
              let data:any = a.payload.doc.data();
              return <Survey>{
                ...data,
                id: a.payload.doc.id,
                createdAt: data["createdAt"].toDate()
              };
            });
          })
        ).subscribe(surveys => {
          if (surveys.length == 0) this.accountService.showHelper = true;
          this.surveys = surveys;
        });
      }
    });
  }

  ngOnInit() {
  }

  array(n: number): any[] {
    return Array(n);
  }

  startNewSurvey() {
    this.aSurvey = new Survey();
    this.create = true;
  }

  createSurvey(d) {
    if (d) {
      this.aSurvey.teamId = this.accountService.aTeam.id;
      this.aSurvey.createdAt = new Date();
      this.accountService.db.collection("survey").add({...this.aSurvey}).then(snapshot => {
        this.aSurvey = new Survey();
      });
      this.create = false;
    } else {
      this.aSurvey = new Survey();
      this.create = false;
    }
  }

  selectSurvey(survey) {
    this.aSurvey = survey;
  }

  checkIfChecked(d) { // terribly inefficient
    return d ? this.aSurvey.types[this.aSurvey.runType].indexOf(d) > -1 : null;
  }

  addTo(d) {
    if (this.aSurvey.types[this.aSurvey.runType].find(day => day == d)) {
      this.aSurvey.types[this.aSurvey.runType].splice(this.aSurvey.types[this.aSurvey.runType].indexOf(d), 1);
    } else {
      this.aSurvey.types[this.aSurvey.runType].push(d);
    }
  }

  saveSurvey(save) {
    if (save) {
      this.accountService.db.collection("survey").doc(this.aSurvey.id).update({...this.aSurvey}).then(() => this.aSurvey = new Survey());
    } else {
      this.aSurvey = new Survey();
    }
  }

  deleteSurvey() {
    this.accountService.db.collection("survey").doc(this.aSurvey.id).delete().then(() => {
      this.aSurvey = new Survey();
      let snackbar = this.snackbar.open("survey deleted", null, {
        duration: 3000
      });
    });
  }

}
