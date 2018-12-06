import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { AccountComponent } from "./account.component";
import { ProfileComponent } from "./account/account.component";
import { LogComponent } from "./log/log.component";
import { TimeComponent } from "./time/time.component";
import { IncidentReportsComponent } from "./incident-reports/incident-reports.component";
import { EventComponent } from "./event/event.component";
import { AchievementsComponent } from "./achievements/achievements.component";
import { AuthGuard } from "./auth.gaurd";

const routes: Routes = [
  {
    path: "",
    component: AccountComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: HomeComponent },
      { path: "account", component: ProfileComponent },
      { path: "log", component: LogComponent },
      { path: "event", component: EventComponent },
      { path: "incident-reports", component: IncidentReportsComponent },
      { path: "achievements", component: AchievementsComponent },
      {
        path: "support",
        loadChildren: "./support/support.module#SupportModule",
        canActivate: [AuthGuard]
      },
      {
        path: "training",
        loadChildren: "./training/training.module#TrainingModule"
      },
      {
        path: "surveys",
        loadChildren: "./surveys/surveys.module#SurveysModule"
      },
      {
        path: "time",
        loadChildren: "./time/time.module#TimeModule"
      },
      {
        path: "self-inspections",
        loadChildren:
          "./self-inspections/self-inspections.module#SelfInspectionsModule"
      },
      { path: "**", redirectTo: "dashboard" }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
