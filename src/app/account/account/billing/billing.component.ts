import { Component, OnInit, AfterViewInit } from '@angular/core';

import { environment } from "../../../../environments/environment";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AccountService } from '../../account.service';

@Component({
  selector: 'billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  private _stripe: any;
  private _elements: any;
  private _card: any;

  constructor(
    public accountService: AccountService,
    private storage: AngularFirestore,
    public auth: AngularFireAuth,
  ) { }

  ngOnInit() {
    //this.race = this.accountService.race;
  }

  load() {
    // Create a Stripe client.
    this._stripe = Stripe(environment.stripe.publishable);

    // Create an instance of Elements.
    this._elements = this._stripe.elements();

    // Create an instance of the card Element.
    const style = { base: { fontSize: "16px" } };
    this._card = this._elements.create("card", { style });

    // Add an instance of the card Element into the `card-element` <div>.
    this._card.mount("#card-element");

    // Handle real-time validation errors from the card Element.
    this._card.addEventListener("change", event => {
      var displayError = document.getElementById("card-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
      //this.isCardValid = event.complete;
    });
  }

}

