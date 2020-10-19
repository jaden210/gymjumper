import { Component, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../app.service';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { Observable } from 'rxjs';
import { Gym } from '../account/account.service';
import * as moment from "moment";
import { map } from 'rxjs/operators';

@Component({
  templateUrl: './find-a-gym.component.html',
  styleUrls: ['./find-a-gym.component.css'],
  providers: [GoogleMapsAPIWrapper]
})
export class FindAGymComponent {

  gyms: Gym[];
  filterGyms: Gym[];
  aGym: Gym = null;
  searchParams = new Map();
  map;
  userLocation;
  loading: boolean = true;
  view: string = "map";
  search: string;
  isLoggedIn: boolean = false;
  userId: string;
  icon = {
    url: './assets/pin.png',
    labelOrigin: { x: 60, y: 35 },
    scaledSize: {
      width: 32,
      height: 32
    }
  }
  label = {
    text: 'gym',
    color: "#212121",
    fontWeight: "bold",
    fontSize: "16px"
  };

  constructor(
    private appService: AppService,
    public agm: GoogleMapsAPIWrapper,
    private ref: ChangeDetectorRef
  ) {
    this.appService.auth.authState.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.userId = user.uid;
      }
      this.appService.getGymLocations().subscribe(gyms => {
        this.gyms = gyms;
        this.filterGyms = gyms;
        this.gyms.map(gym => {
          gym['label'] = {
            text: gym.name,
            color: "#212121",
            fontWeight: "bold",
            fontSize: "16px"
          }
          if (this.isLoggedIn) this.getLastUserVisit(gym.id).subscribe(visits => {
            visits[0] ? gym['lastVisit'] = visits[0] : null;
            if (gym.restrictionCount) {
              gym['remainingVisits'] = gym.restrictionCount - visits.filter(visit => visit.createdAt <= moment().subtract(30, 'days')).length;
            }
          });
        })
      });
    })
    this.loading = true;
    navigator.geolocation.getCurrentPosition((position) => {
      this.userLocation = position.coords;
      this.updateMap(position.coords);
    }, error => {
      let position = {latitude: 37.17582, longitude: -113.5014213};    
      this.updateMap(position);
    });
  }

  getLastUserVisit(gymId) {
    return this.appService.db.collection("visits", ref => ref
    .where("gymId", "==", gymId)
    .where("userId", "==", this.userId)
    .orderBy("createdAt", "desc"))
    .snapshotChanges()
    .pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        data['createdAt'] = moment(data["createdAt"].toDate(), "YYYYMMDD");
        return { ...data, id };
      })
    ));
  }

  getIcon() {
    return this.icon;
  }

  getLabel(gym) {
    this.label.text = gym.name;
    return this.label;
  }

  searchByZip(search: string = '') {
    let filterGyms = this.gyms.filter(gym => gym.name.toLowerCase().search(search.toLowerCase()) !== -1);
    if (filterGyms.length > 0) {
      this.filterGyms = filterGyms;
      this.updateMap(this.userLocation);
    } else if (search.length) {
      this.appService.geocodeLocation(search).subscribe(coords => {
        this.updateMap(coords);
      }, error => {
        console.log(error);
      });
    } else this.updateMap(this.userLocation);
  }

  swapView() {
    this.aGym = null;
    if (this.view == 'list') {
      this.view = 'map';
    } else {
      this.view = 'list';
    }
  }

  updateMap(coords) {
    this.searchParams.lat = coords.latitude;
    this.searchParams.long = coords.longitude;
    this.searchParams.zoom = 13;
    this.ref.detectChanges();
    this.loading = false;
  }

  getDirections() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${this.aGym.latitude},${this.aGym.longitude}`, '_blank');
  }
}

export class Map {
  lat: number;
  long: number;
  zoom: number;
}