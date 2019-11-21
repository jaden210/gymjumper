import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ProfileComponent,
  DeleteAccountDialog,
  PrintDialog
} from "./account/account.component";
import { AccountRoutingModule } from "./account-routing.module";
import { MaterialModule } from "../material/material.module";
import { AccountComponent } from "./account.component";
import { FormsModule } from "@angular/forms";
import { MomentModule } from "ngx-moment";
import { MapDialogComponent } from "./map-dialog/map-dialog.component";
import { DatePipe } from "@angular/common";
import { SharedModule } from "../shared-module";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { AgmCoreModule } from "@agm/core";
import { QRCodeModule } from 'angular2-qrcode';
import { PrintComponent } from "./print/print.component";
import { ScanDialog } from "./scan-dialog/scan-dialog.component";
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { LibraryComponent } from "./library/library.component";
import { BirdComponent } from "./library/bird/bird.component";
import { BirdVideoDialog } from "./dialogs/bird-video-upload/bird-video-upload.component";
import { BirdPhotoDialog } from "./dialogs/bird-photo-upload/bird-photo-upload.component";
import { RacesComponent } from "./races/races.component";
import { RaceComponent } from "./races/race/race.component";
import { CreateRaceComponent } from "./races/create-race/create-race.component";
import { EnterDialog } from "./dialogs/enter/enter.component";

@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    MaterialModule,
    FormsModule,
    MomentModule,
    SharedModule,
    AngularEditorModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyAsIwXbCi4l__VoFLdru1EC3bLxmcZQOZI"
    }),
    QRCodeModule,
    ZXingScannerModule
  ],
  declarations: [
    AccountComponent,
    ProfileComponent,
    MapDialogComponent,
    DeleteAccountDialog,
    PrintComponent,
    PrintDialog,
    ScanDialog,
    LibraryComponent,
    BirdComponent,
    BirdVideoDialog,
    BirdPhotoDialog,
    RacesComponent,
    RaceComponent,
    CreateRaceComponent,
    EnterDialog
  ],
  exports: [MaterialModule],
  entryComponents: [
    MapDialogComponent,
    DeleteAccountDialog,
    PrintDialog,
    ScanDialog,
    BirdPhotoDialog,
    BirdVideoDialog,
    EnterDialog
  ],
  providers: [DatePipe]
})
export class AccountModule {}
