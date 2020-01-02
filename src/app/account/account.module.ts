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
import { BillingComponent } from "./account/billing/billing.component";
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
    BillingComponent
  ],
  exports: [MaterialModule],
  entryComponents: [
    MapDialogComponent,
    DeleteAccountDialog,
    PrintDialog,
    ScanDialog
  ],
  providers: [DatePipe]
})
export class AccountModule {}
