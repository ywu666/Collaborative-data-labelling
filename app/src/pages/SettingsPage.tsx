import {
    IonContent,
    IonPage,
    IonButtons,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
  } from '@ionic/react';
  import React from 'react';
  import { useParams } from 'react-router';
  import SettingsTags from '../components/SettingsTags';
  
  import './SettingsPage.css';
  
  const SettingsPage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
  
    const tags: string[] = ["One", "Two", "Three"];
  
  
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

            <IonContent class="main">
                <IonGrid>
                    <IonRow class="ion-justify-content-center">
                        <IonCol  size="6">
                            <SettingsTags tags={tags} />
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
  };
  
  export default SettingsPage;
  