import { Component, OnInit , ViewChild} from '@angular/core';
import { map } from 'rxjs/operators';
import { User } from '../../../app.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SupportService } from '../support.service';
import { Gym } from '../../account.service';

@Component({
  selector: 'statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  aItem: Support; // temp var
  gyms = [];
  displayedColumns: string[] = ["name", "created","users"];
  datasource = new MatTableDataSource(this.gyms)

  constructor(public supportService: SupportService) { }

  ngOnInit() {
    this.datasource.sort = this.sort;
    this.getGyms();
  }

  getGyms() {
    this.supportService.db.collection("gyms", ref => ref.orderBy("createdAt", "desc")).snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          //better way
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          data.createdAt = data.createdAt.toDate();
          return { id, ...data };
        })
        )
    ).subscribe(gyms => {
      this.gyms = gyms;
      gyms.forEach((gym: any) => {
        if (gym.id) {
          this.supportService.db.collection("activity", ref => ref.where("gymId", "==", gym.id)).valueChanges().subscribe(activity => {
            gym.activity = activity;
          });  
        }
      })
    });
  }
}

export class Support {
  id?: string;
  createdAt: any;
  email: string;
  body: string;
  isUser?: boolean = false;
  user?: User;

  respondedAt?: any;
  notes?: string;
}