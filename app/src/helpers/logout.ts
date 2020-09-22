import firebase from "firebase";

function onLogout() {
    firebase.auth().signOut().then(function() {
      localStorage.clear();
      console.log(
        'Sign-out successful.' + localStorage.getItem('user-token')
      );
    })
    .catch(function (error) {
      // An error happened.
    });
  }

  export default onLogout;