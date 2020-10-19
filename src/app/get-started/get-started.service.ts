import { Injectable } from "@angular/core";
import { AppService } from "../app.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from "../account/account.service";

@Injectable()
export class GetStartedService {
  name: string;

  constructor(
    private appService: AppService,
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {}

  get Email(): string {
    return this.appService.email;
  }

  createAuthUser(password): Promise<firebase.auth.UserCredential> {
    return this.auth
      .createUserWithEmailAndPassword(this.Email, password)
      .catch(error => {
        console.error(error);
        throw error;
      });
  }

  createUser(user: firebase.auth.UserCredential): Promise<any> {
    let newUser = new User();
    newUser.id = user.user.uid;
    newUser.email = user.user.email;
    newUser.profileUrl = user.user.photoURL || null;
    newUser.name = this.name;
    newUser.isDev = false;
    return this.db
      .collection("user")
      .doc(newUser.id)
      .set({ ...newUser })
      .then(() => newUser)
      .catch(error => {
        console.error(error);
        throw error;
      });
  }
}
