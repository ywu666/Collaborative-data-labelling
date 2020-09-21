import React from 'react';
import Firebase from './firebase';

const FirebaseContext =  React.createContext<Firebase | null>(null);

export const withFirebase = (Component: React.ComponentClass) => (props: any) => (
    <FirebaseContext.Consumer>
        {firebase => <Component {...props} firebase={firebase} />}
    </FirebaseContext.Consumer>
)

export default FirebaseContext