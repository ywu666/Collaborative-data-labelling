import firebase from "firebase";

function onLogout() {
    firebase.auth().signOut().then(function() {
        localStorage.clear()
        window.location.href = '/auth';
    })
    .catch(function (error) {
      // An error happened.
    });
  }

  export default onLogout;