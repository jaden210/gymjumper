import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  loginErrorStr;
  email;
  gyms;

  constructor(
    public appService: AppService,
    private router: Router,
    public auth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.getGyms();
  }

  getGyms() {
    this.appService.getGymLocations().subscribe(gyms => {
      gyms.slice(1,7);
      this.gyms = gyms;
    });
  }

  createAccount(): void {
    this.loginErrorStr = !this.email ? "email required" : null;
    if (!this.loginErrorStr) {
      this.appService.email = this.email;
      this.appService.checkForExistingUser(this.email).then(
        isExistingUser => {
          !isExistingUser ? this.router.navigate(["/get-started"]) : this.router.navigate(["/sign-in"]);
        },
        error => (this.loginErrorStr = error)
      );
    }
  }

  routeSignUp() {
    this.auth.onAuthStateChanged(user => {
      if (user && user.uid) {
        this.router.navigate(["account"]);
      } else {
        this.router.navigate(["/sign-up"]);
      }
    });
  }
}
