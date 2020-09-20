import app from 'firebase/app';
import 'firebase/auth';
import firebase from "firebase";

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
    private auth: firebase.auth.Auth;

    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
    }

    doCreateUserWithEmailAndPassword = (email: string, password: string) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email: string, password: string) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = (password: string) =>
        this.auth.currentUser?.updatePassword(password);
}

export default Firebase;