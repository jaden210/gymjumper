import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  
  rooms: Room[] = [];
  room: Room = new Room();
  roomTypes = [
    "test","test2"
  ];
  components = [
    "high", "high-low", "high/organizer/high"
  ]

  colors = ["white", "textured gray"];

  depths = [12,14,16];

  constructor(public appService: AppService){}

  addRoom() {
    let room = new Room();
    let newWall = new Wall();
    room.walls.push(newWall);
    this.rooms.push(room);
    this.room = room;
  }

  addWall() {
    let newWall = new Wall();
    this.room.walls.push(newWall);
  }

  selectRoom(room) {
    this.room = room;
  }

  reset() {
    this.rooms = [];
    this.room = new Room();
    this.addRoom();
  }

  ngOnInit() {
    this.addRoom();
  }

  submit() {
    this.appService.db.collection("closets").add({...this.rooms}).then(() => {
      this.reset();
    })
  }

}



export class Room {
  name: any;
  roomType: any;
  walls: Wall[] = [];
  color: any;
}

export class Wall {
  width: number;
  depth: number = 16;
  component: any;
}