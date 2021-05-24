import app from 'firebase/app';
import 'firebase/auth';
import firebase from "firebase";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
    apiKey: "AIzaSyBF8xcbg2ipLYEvwtbopRBuZeVf0o5yNSM",
    authDomain: "collaborative-data-labelling.firebaseapp.com",
    projectId: "collaborative-data-labelling",
    storageBucket: "collaborative-data-labelling.appspot.com",
    messagingSenderId: "622015500073",
    appId: "1:622015500073:web:41715cfded3590c45c7138",
    measurementId: "G-RV8EPBQNQ4"
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