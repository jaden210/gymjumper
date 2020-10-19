import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormControl, Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { AppService } from "../app.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"]
})
export class SignInComponent {
  email: FormControl;
  password: FormControl;
  signinError: string;
  showResetPassword: boolean;

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private appService: AppService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    let emailStr = this.appService.email || "";
    this.email = new FormControl(emailStr, [
      Validators.required,
      Validators.email
    ]);
    this.password = new FormControl("", [Validators.required]);
  }

  getEmailErrorMessage() {
    return this.email.hasError("required")
      ? "email required"
      : this.email.hasError("email")
      ? "not a valid email"
      : "";
  }

  signIn(): void {
    this.signinError = null;
    this.auth
      .signInWithEmailAndPassword(this.email.value, this.password.value)
      .then(
        () => {
          if (!document.location.pathname.includes('visit')) this.router.navigate(["/account"]);
        },
        error => {
          console.error(error);
          if (error.code == "auth/user-not-found") {
            this.appService.getInvites(this.email.value).subscribe(invites => {
              if (invites.length > 0) this.router.navigate(["/join-team"]);
              else
                this.signinError =
                  "No users found matching this email address, create a new account";
            });
          } else if (error.code == "auth/wrong-password") {
            this.showResetPassword = true;
            this.signinError = "Your password is invalid";
          } else this.signinError = error.message;
        }
      );
  }

  resetPassword(email: string) {
    return this.auth
      .sendPasswordResetEmail(email)
      .then(() => {
        this.signinError = null;
        // pop snackbar
        this.snackBar.open(`Reset password email sent to ${email}`, null, {
          duration: 6000
        });
        this.password.setValue(null);
        this.password.markAsPristine();
        console.log("sent Password Reset Email!");
      })
      .catch(error => console.log(error));
  }
}
