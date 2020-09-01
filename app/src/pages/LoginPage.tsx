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
import './Page.css';
import { LoginInput } from '../components/LoginInput';
import { css } from 'glamor';
import "../components/ExploreContainer.css"
const container = css({
  
  // justifyContent: 'center',
});

const LoginPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>

    
      <IonContent >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <LoginInput />
        </div>
      </IonContent>
     
    </IonPage>
  );
};

export default LoginPage;
