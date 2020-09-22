import firebase from "firebase";

function onLogout() {
    firebase.auth().signOut().then(function() {
        console.log(
            'Sign-out successful.' + localStorage.getItem('user-token')
        );
        localStorage.removeItem('user-token');
    })
    .catch(function (error) {
      // An error happened.
    });
  }

  export default onLogout;