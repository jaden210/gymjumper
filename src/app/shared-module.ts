import { NgModule, ModuleWithProviders } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "./material/material.module";
import { UserNamePipe } from "./user-name.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ],
  declarations: [UserNamePipe],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserNamePipe,
    MaterialModule
  ],
  entryComponents: [],
  providers: []
})
export class SharedModule {
}
