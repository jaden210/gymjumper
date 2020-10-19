import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { SharedModule } from "./shared-module";

import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { environment } from "../environments/environment";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent, NavigationSheet } from "./app.component";
import { MaterialModule } from "./material/material.module";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { SupportComponent } from "./support/support.component";
import { PricingComponent } from "./pricing/pricing.component";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";
import { SignUpPageComponent } from "./sign-up-page/sign-up-page.component";
import { FooterComponent } from "./footer/footer.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { HowComponent } from "./how/how.component";
import { TermsOfUseComponent } from "./terms-of-use/terms-of-use.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { CustomerAgreementComponent } from "./customer-agreement/customer-agreement.component";
import { VideoDialogComponent } from "./video-dialog/video-dialog.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { GetStartedModule } from "./get-started/get-started.module";
import { CommonQuestionsComponent } from "./common-questions/common-questions.component";
import { FindAGymComponent } from "./find-a-gym/find-a-gym.component";
import { AgmCoreModule } from "@agm/core";
import { VisitComponent } from "./visit/visit.component";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SupportComponent,
    PricingComponent,
    AboutComponent,
    HowComponent,
    ContactComponent,
    SignUpPageComponent,
    FooterComponent,
    SignInComponent,
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    CustomerAgreementComponent,
    VideoDialogComponent,
    SignUpComponent,
    VisitComponent,
    CommonQuestionsComponent,
    FindAGymComponent,
    NavigationSheet
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    FormsModule,
    AngularEditorModule,
    HttpClientModule,
    GetStartedModule,
    SharedModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyAqPjAkJcXT-jKqDFBTOhSPZhwqU2XCfO0"
    })
  ],
  entryComponents: [
    VideoDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
