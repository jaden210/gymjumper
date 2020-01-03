import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { Observable } from 'rxjs';
import { Race } from './race/race.component';

@Component({
  selector: 'races',
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.css']
})
export class RacesComponent implements OnInit {

  races;

  constructor(
    public accountService: AccountService
  ) { }

  ngOnInit() {
    
  }

  newRace() {
    this.accountService.makeRace = true;
  }

  viewRace(race) {
    this.accountService.race = race;
  }

  createRace(race) {
    this.accountService.makeRace = true;
    this.accountService.race = new Race();
  }

}