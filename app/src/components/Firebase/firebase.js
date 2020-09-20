import app from 'firebase/app';
import 'firebase/auth';

const config = {
    apiKey: "AIzaSyBjxqi-CKBglWGn4Dfj0rkY4-mtwP_nwMk",
    authDomain: "collaborative-content-coding.firebaseapp.com",
    databaseURL: "https://collaborative-content-coding.firebaseio.com",
    projectId: "collaborative-content-coding",
    storageBucket: "collaborative-content-coding.appspot.com",
    messagingSenderId: "172478633646",
    appId: "1:172478633646:web:004d73a6e1b65283b63f3f",
    measurementId: "G-Y8T1KM5DSB"
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
    }

    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);
}

export default Firebase;