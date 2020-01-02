"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const moment = require("moment");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ timestampsInSnapshots: true });
const stripe = require("stripe")(functions.config().stripe.token);
//When a user is created, register them with Stripe
exports.createStripeCustomer = functions.auth.user().onCreate(user => {
    return stripe.customers
        .create({
        email: user.email,
        description: "new Customer"
    })
        .then(customer => {
        return admin
            .firestore()
            .collection("team")
            .where("ownerId", "==", user.uid)
            .get()
            .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                // should only be one, can't think of a better way
                return admin
                    .firestore()
                    .doc("team/" + doc.id)
                    .update({ stripeCustomerId: customer.id });
            });
        })
            .catch(error => {
            return console.log("Error getting documents: ", error);
        });
    });
});
// exports.customerEnteredCC = functions.firestore
//   .document("user/{userId}")
//   .onUpdate((change, context) => {
//     let oldCustomer = change.before.data();
//     let newCustomer = change.after.data();
//     if (!oldCustomer.cardToken && newCustomer.cardToken) { // register the Customer
//         stripe.customers
//         .create({
//             email: newCustomer.email,
//             description: `new Customer: ${newCustomer.name}`,
//             source : newCustomer.cardToken.id
//         })
//         .then(customer => {
//           const days = moment().diff(moment(newCustomer.createdAt.toDate()), "days");
//           stripe.subscriptions
//             .create({
//               customer: customer.id,
//               trial_period_days: days < 0 ? 0 : days,
//               items: [
//                 { plan: "basic" } 
//               ]
//             })
//             .then(
//               subscription => {
//                 admin
//                   .firestore()
//                   .doc(`team/${change.after.id}`)
//                   .update({
//                     stripeSubscriptionId: subscription.id,
//                     stripePlanId: "small-teams"
//                   });
//                 console.log(
//                   `customer ${customer.id} subscribed to small teams`
//                 );
//               },
//               error => console.log(`error: ${error}`)
//             );
//         });
//     } else if (oldT.cardToken !== newT.cardToken) {
//       // updated CC
//       stripe.customers
//         .update(newT.stripeCustomerId, {
//           source: newT.cardToken.id
//         })
//         .then(
//           () => console.log(`customer card updated`),
//           error => console.log(`error: ${error}`)
//         );
//     }
//   });
exports.newSubscription = functions.firestore
    .document("user/{userId}")
    .onUpdate((change, context) => {
    let oldCustomer = change.before.data();
    let newCustomer = change.after.data();
    if (!oldCustomer.cardToken && newCustomer.cardToken) { // register the Customer
        stripe.customers
            .create({
            email: newCustomer.email,
            description: `new Customer: ${newCustomer.name}`,
            source: newCustomer.cardToken.id
        })
            .then(customer => {
            const days = moment().diff(moment(newCustomer.createdAt.toDate()), "days");
            stripe.subscriptions
                .create({
                customer: customer.id,
                trial_period_days: days < 0 ? 0 : days,
                items: [
                    { plan: "pro-plan" }
                ]
            })
                .then(subscription => {
                admin
                    .firestore()
                    .doc(`user/${newCustomer.id}`)
                    .update({
                    stripeSubscriptionId: subscription.id,
                    stripePlanId: "pro-plan"
                });
                console.log(`customer ${customer.id} subscribed to pro plan`);
            }, error => console.log(`error: ${error}`));
        });
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
// exports.setStripePlan = functions.https.onRequest((req, res) => {
//   const body = req.body;
//   const newPlan = body.plan;
//   const subscriptionId = body.stripeSubscriptionId;
//   const quantity = body.stripeQuantity;
//   stripe.subscriptions.retrieve(subscriptionId).then(subscription => {
//     stripe.subscriptions
//       .update(subscriptionId, {
//         cancel_at_period_end: false,
//         items: [
//           {
//             id: subscription.items.data[0].id,
//             plan: newPlan,
//             quantity: quantity || 1
//           }
//         ]
//       })
//       .then(charge => {
//         res.status(200).send("Success");
//       })
//       .catch(err => {
//         res.status(500).send(err);
//       });
//   });
// });
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
// exports.inviteNewUser = functions.firestore
//   .document("invitation/{invitationId}")
//   .onCreate(snapshot => {
//     let info = snapshot.data();
//     const nodemailer = require("nodemailer");
//     const db = admin.firestore();
//     const mailTransport = nodemailer.createTransport(
//       `smtps://support@Gym Jumper.com:thechimpishere@smtp.gmail.com`
//     );
//     const mailOptions: any = {
//       from: '"Gym Jumper" <support@Gym Jumper.com>',
//       to: info.inviteEmail
//     };
//     mailOptions.subject =
//       "You have been invited to join " +
//       info.companyName +
//       " at Gym Jumper";
//     mailOptions.html = `Hi ${info.inviteName}<br><br>
//   ${
//     info.companyName
//   } is using Gym Jumper to manage safety training, worksite logs, record keeping, and more, as part of an ongoing commitment to safety and compliance. You've been invited to the team using ${
//       info.inviteEmail
//     }. Please visit the App Store or Goolge Play Store to download the free app and join your team today. Feel free to contact us at support@Gym Jumper.com with any questions, and welcome!
//   <br><br> <a href='https://play.google.com/store/apps/details?id=com.betterspace.Gym Jumper&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>Get it on Google Play</a>
//   <a href="https://itunes.apple.com/us/app/Gym Jumper/id1445077154?mt=8" target="_blank">Download On The App Store</a>
//     <br><br>Sincerely,
//     <br><br>Alan, Client Success Team
//     <br>Gym Jumper
//     <br>support@Gym Jumper.com`;
//     return mailTransport
//       .sendMail(mailOptions)
//       .then(() => {
//         console.log(`New invitation email sent to:` + info.inviteName);
//       })
//       .catch(error => {
//         console.error("There was an error while sending the email:", error);
//       });
//   });
// <img style="height:40px" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/>
// <img src="https://ci3.googleusercontent.com/proxy/g1y2q1E32rMt83ssyVpqp3ZQPEoac4P1Fiwb5hhuEinR4h1xf_AXPCtR1CG-C8WpRQGTpcyC_E1252Gc_NG-g008x9PlGLIKoOJcMGyAVwRZptSn0X-HTfuWcf23tcOWT6pdITnr87pYlODzJTRRlKQIMNKvbhN0JA=s0-d-e1-ft" alt="Download On The App Store" border="0"; style="max-width:100%;height: 29px;margin-bottom: 5px;">
// <img style="height:40px" alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/>
// <img src="https://ci3.googleusercontent.com/proxy/g1y2q1E32rMt83ssyVpqp3ZQPEoac4P1Fiwb5hhuEinR4h1xf_AXPCtR1CG-C8WpRQGTpcyC_E1252Gc_NG-g008x9PlGLIKoOJcMGyAVwRZptSn0X-HTfuWcf23tcOWT6pdITnr87pYlODzJTRRlKQIMNKvbhN0JA=s0-d-e1-ft" alt="Download On The App Store" border="0" style="max-width:100%;height: 29px;margin-bottom: 5px;">
// exports.newTeamEmail = functions.firestore
//   .document("team/{teamId}")
//   .onCreate((change, context) => {
//     const db = admin.firestore();
//     let newTeam = change.data();
//     const nodemailer = require("nodemailer");
//     let user;
//     db.doc("user/" + newTeam.ownerId)
//       .get()
//       .then(teamUser => {
//         user = teamUser.data();
//         const mailTransport = nodemailer.createTransport(
//           `smtps://support@Gym Jumper.com:thechimpishere@smtp.gmail.com`
//         );
//         const mailOptions: any = {
//           from: '"Gym Jumper" <support@Gym Jumper.com>',
//           to: user.email
//         };
//         mailOptions.subject =
//           "Welcome to your free 30 day trial of Gym Jumper!";
//         mailOptions.html = `Hi ${user.name}<br><br>
//       Glad to meet you! We want you to get the most out of Gym Jumper during these first 30 days. If you haven't already, visit the Badges page inside your account, which walks you through the various features of the platform as an owner or administrator. Remember, Gym Jumper is largely driven from our free app which can be found below. Head over and get the app if you haven't already. As you invite your team, they'll do the same. Please take advantage of the many benefits of the platform which enable compliance, including: training your team and getting their survey responses, capturing worksite logs, performing self-inspection, and more.
//       <br><br> <a href='https://play.google.com/store/apps/details?id=com.betterspace.Gym Jumper&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>Get it on Google Play</a>
//       <a href="https://itunes.apple.com/us/app/Gym Jumper/id1445077154?mt=8" target="_blank">Download On The App Store</a>
//       <br><br>Don't hesitate to contact us with any questions at support@Gym Jumper.com, and enjoy!
//       <br><br>Sincerely,
//       <br><br>Alan, Client Success Team
//       <br>Gym Jumper
//       <br>support@Gym Jumper.com`;
//         return mailTransport
//           .sendMail(mailOptions)
//           .then(() => {
//             console.log(`New Team email sent to:` + user.name);
//           })
//           .catch(error => {
//             console.error("There was an error while sending the email:", error);
//           });
//       })
//       .catch(error => {
//         console.log(error + ": no user found to send email");
//         return;
//       });
//   });
// exports.supportTicketSubmitted = functions.firestore
//   .document("support/{supportId}")
//   .onCreate(snapshot => {
//     let info = snapshot.data();
//     const nodemailer = require("nodemailer");
//     const db = admin.firestore();
//     const mailTransport = nodemailer.createTransport(
//       `smtps://support@Gym Jumper.com:thechimpishere@smtp.gmail.com`
//     );
//     const mailOptions: any = {
//       from: '"Gym Jumper" <support@Gym Jumper.com>',
//       to: info.email
//     };
//     mailOptions.subject =
//       "We have received your message - hello from Gym Jumper";
//     mailOptions.html = `Hi there<br><br>
//     This is just a friendly note to say we've received your message and will respond as quickly as possible.
//     <br><br>Thank you,
//     <br><br>Ken, Client Support
//     <br>Gym Jumper
//     <br>support@Gym Jumper.com`;
//     return mailTransport
//       .sendMail(mailOptions)
//       .then(() => {
//         console.log(`New invitation email sent to:` + info.email);
//       })
//       .catch(error => {
//         console.error("There was an error while sending the email:", error);
//       });
//   });
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