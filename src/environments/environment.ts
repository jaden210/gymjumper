// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
<<<<<<< HEAD
    apiKey: "AIzaSyAqPjAkJcXT-jKqDFBTOhSPZhwqU2XCfO0",
    authDomain: "gym-jumper.firebaseapp.com",
    databaseURL: "https://gym-jumper.firebaseio.com",
    projectId: "gym-jumper",
    storageBucket: "gym-jumper.appspot.com",
    messagingSenderId: "988712624451"
  },
  stripe: {
    publishable: "pk_live_E3xj3zTROUC8hfFORjeO4keB00xBXADHCx"
=======
    apiKey: "AIzaSyB13rG9_VDgDBdrvxsNjdXO5tHx5e_XKUw",
    authDomain: "pigeonflydb.firebaseapp.com",
    databaseURL: "https://pigeonflydb.firebaseio.com",
    projectId: "pigeonflydb",
    storageBucket: "pigeonflydb.appspot.com",
    messagingSenderId: "576806229342",
    appId: "1:576806229342:web:72e303428cd179b1c76bcf",
    measurementId: "G-7D8Z8Z50CC"
>>>>>>> f4ee204c978e76728a2b5a9724007b00a4efe7d0
  }
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
