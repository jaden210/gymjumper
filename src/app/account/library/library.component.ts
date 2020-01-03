import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  birds;

  constructor(
    public accountService: AccountService
  ) { }

  ngOnInit() {
    
  }

  newBird() {
    this.accountService.makeBird = true;
  }

  editBird(bird) {
    this.accountService.makeBird = true;
    this.accountService.bird = bird;
  }

}