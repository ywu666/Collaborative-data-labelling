import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React from 'react';
import { useParams } from 'react-router';
import './LoginPage.css';
import Header from "../components/Header"
import SignInPage from "../components/SignIn";
const LoginPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  return (
    <IonPage>
      <Header name='' logout={false}/>

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="login-container">
          <SignInPage />
        </div>
        <div className="center">
        <p>Don't have an account? <a href="http://localhost:3000/signup">Sign up here</a></p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
