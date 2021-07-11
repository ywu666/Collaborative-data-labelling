import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
  } from '@ionic/react';
import React from 'react';
import { useParams } from 'react-router';
import './LoginPage.css';
import SignUp from "../components/SignUp";
import Header from '../components/Header';

const SignUpPage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
  
    return (
      <IonPage>
      <Header name='' routerLink={"/auth"} logout={false}/>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="login-container">
          <SignUp />
        </div>
      </IonContent>
    </IonPage>
    );
  };
  
  export default SignUpPage;
  