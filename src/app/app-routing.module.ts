import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { PricingComponent } from "./pricing/pricing.component";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";
import { SupportComponent } from "./support/support.component";
import { SignUpPageComponent } from "./sign-up-page/sign-up-page.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { HowComponent } from "./how/how.component";
import { TermsOfUseComponent } from "./terms-of-use/terms-of-use.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { CustomerAgreementComponent } from "./customer-agreement/customer-agreement.component";
import { AuthGuard } from "./auth.gaurd";
import { FindAGymComponent } from "./find-a-gym/find-a-gym.component";
import { VisitComponent } from "./visit/visit.component";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "visit/:id", component: VisitComponent },
  { path: "pricing", component: PricingComponent },
  { path: "about", component: AboutComponent },
  { path: "contact", component: ContactComponent },
  { path: "support", component: SupportComponent },
  { path: "how-it-works", component: HowComponent },
  { path: "sign-up", component: SignUpPageComponent },
  { path: "sign-in", component: SignInComponent },
  { path: "find-a-gym", component: FindAGymComponent },
  {
    path: "get-started",
    loadChildren: "./get-started/get-started.module#GetStartedModule"
  },
  { path: "terms-of-service", component: TermsOfUseComponent },
  { path: "privacy-policy", component: PrivacyPolicyComponent },
  { path: "customer-agreement", component: CustomerAgreementComponent },
  {
    path: "account",
    loadChildren: "./account/account.module#AccountModule",
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
