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

  loadingBilling: boolean = false;

  loaded: boolean = false;

  constructor(
    public accountService: AccountService,
    private storage: AngularFirestore,
    public auth: AngularFireAuth,
  ) { }

  ngOnInit() {
    //this.race = this.accountService.race;
  }

  load() {
    this.accountService.user.cardToken = null;
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
    this.loaded = true;
        // Listen for form submission, process the form with Stripe,
    // and get the 
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', event => {
      event.preventDefault();
      this._stripe.createToken(this._card).then(result => {
        if (result.error) {
          console.log('Error creating payment method.');
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // At this point, you should send the token ID
          // to your server so it can attach
          // the payment source to a customer
          console.log('Token acquired!');
          this.accountService.db.doc(`user/${this.accountService.user.id}`)
          .update({cardToken:result.token}).then(result => {
            console.log('done!');
          })
        }
      });
    })
  }


  async getBillingHistory() {
    this.loadingBilling = true;
    const res = await fetch("", {
      method: 'POST',
      body: JSON.stringify({
        stripeCustomerId: this.accountService.user.stripeCustomerId,
      }),
    });
    const data = await res.json();
    data.body = JSON.parse(data.body);
    return data;
  }

}

