"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });
const stripe = require("stripe")(functions.config().stripe.token);
exports.newUserCreated = functions.firestore
    .document("/user/{userId}")
    .onCreate((snapshot, context) => {
    const user = snapshot.data() || {};
    const nodemailer = require("nodemailer");
    const mailTransport = nodemailer.createTransport(`smtps://support@gymjumper.io:jumptoallgyms@smtp.gmail.com`);
    const mailOptions = {
        from: '"Gymjumper" <support@gymjumper.io>',
        to: user.email
    };
    mailOptions.subject = "Welcome to Gymjumper";
    const nameArr = user.name ? user.name.split(" ") : null;
    const name = nameArr && nameArr.length ? nameArr[0] : null;
    const welcomeText = name ? `Hi ${name},` : "Hi there,";
    const text = `${welcomeText}<br/><br/>
    Welcome to the Gymjumper tribe.  Your community is now your personal playground. 
    Take advantage of the awesomeness and try some new activities.  Maybe jump some tramps,  or put some skates on and hit the roller rink. 
     Your fitness options are now endless.<br/><br/>
     Not sure where to start?  Click here to see the map of all our partners.  <a href="https://gymjumper.io/find-a-gym">https://gymjumper.io/find-a-gym</a><br/><br/>
     Welcome... and enjoy!<br/><br/>
    Jacob<br/><br/>
    Gymjumper<br/>
    <a>support@gymjumper.io</a><br/>
    <a href='https://gymjumper.io'>https://gymjumper.io</a><br/>
    `;
    mailOptions.html = text;
    return mailTransport
        .sendMail(mailOptions)
        .then(() => console.log(`New account creation email sent to: ${user.email}`))
        .catch((error) => {
        console.error(`An error occured sending a transaction email to ${user.email}. Error: ${JSON.stringify(error)}`);
    });
});
exports.newSubscription = functions.firestore
    .document("user/{userId}")
    .onUpdate((change, context) => {
    let oldCustomer = change.before.data();
    let newCustomer = change.after.data();
    if (!oldCustomer.cardToken && newCustomer.cardToken) { // register the Customer
        stripe.customers
            .create({
            name: newCustomer.name,
            email: newCustomer.email,
            description: `new Customer: ${newCustomer.name}`,
            source: newCustomer.cardToken.id,
        })
            .then(customer => {
            stripe.subscriptions
                .create({
                customer: customer.id,
                items: [
                    { price: 'pro-plan' }
                ]
            })
                .then(() => console.log(`customer ${customer.id} subscribed.`), error => console.log(`error: ${error}`));
        }, error => console.log(error));
    }
    else if (oldCustomer.cardToken !== newCustomer.cardToken) {
        // updated CC
        stripe.customers
            .update(newCustomer.stripeCustomerId, {
            source: newCustomer.cardToken.id
        })
            .then(() => console.log(`customer card updated`), error => console.log(`error: ${error}`));
    }
});
// exports.getCustomerInvoices = functions.https.onRequest((req, res) => {
//   const body = req.body;
//   const teamId = body.teamId;
//   const stripeCustomerId = body.stripeCustomerId;
//   stripe.invoices
//     .list({
//       customerId: stripeCustomerId
//     })
//     .then(list => {
//       admin
//         .firestore()
//         .doc(`team/${teamId}`)
//         .update({ stripeInvoices: list, stripeInvoicesRetrievedAt: new Date() })
//         .then(() => {
//           res.status(200).send("Success");
//         });
//     })
//     .catch(err => {
//       res.status(500).send(err);
//     });
// });
// exports.teamDisabled = functions.firestore
//   .document("team/{teamId}")
//   .onUpdate((change, context) => {
//     let oldTeam = change.before.data();
//     let newTeam = change.after.data();
//     if (oldTeam.disabled == false && newTeam.disabled == true) {
//       const nodemailer = require("nodemailer");
//       const db = admin.firestore();
//       let disabledAt = newTeam.disabledAt.toDate();
//       const mailTransport = nodemailer.createTransport(
//         `smtps://support@Gym Jumper.com:thechimpishere@smtp.gmail.com`
//       );
//       const mailOptions: any = {
//         from: '"Gym Jumper" <support@Gym Jumper.com>',
//         to: "support@Gym Jumper.com"
//       };
//       mailOptions.subject = `${newTeam.name} has deleted their account`;
//       mailOptions.html = `Looks like ${
//         newTeam.name
//       } decided to leave. The team has been disabled and on ${disabledAt}. 
//     If you want to contact them their phone number is: ${newTeam.phone}`;
//       return mailTransport.sendMail(mailOptions).catch(error => {
//         console.error("There was an error while sending the email:", error);
//       });
//     } else if (oldTeam.disabled == true && newTeam.disabled == false) {
//       const nodemailer = require("nodemailer");
//       const db = admin.firestore();
//       const mailTransport = nodemailer.createTransport(
//         `smtps://support@Gym Jumper.com:thechimpishere@smtp.gmail.com`
//       );
//       const mailOptions: any = {
//         from: '"Gym Jumper" <support@Gym Jumper.com>',
//         to: "support@Gym Jumper.com"
//       };
//       mailOptions.subject = `${newTeam.name} has re-activated their account`;
//       mailOptions.html = `Looks like ${
//         newTeam.name
//       } decided to come back. If you want to contact them their phone number is: ${
//         newTeam.phone
//       }`;
//       return mailTransport.sendMail(mailOptions).catch(error => {
//         console.error("There was an error while sending the email:", error);
//       });
//     }
//   });
//# sourceMappingURL=index.js.map