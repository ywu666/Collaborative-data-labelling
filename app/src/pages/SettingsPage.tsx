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
    IonButton,
    IonIcon,
  } from '@ionic/react';
  import { arrowBackOutline } from 'ionicons/icons';
  import React from 'react';
  import { useParams } from 'react-router';
  import SettingsTags from '../components/SettingsTags';
  
  import './SettingsPage.css';
  
  const SettingsPage: React.FC = () => {
    const { project } = useParams<{ project: string }>();
  
    const tags: string[] = ["One", "Two", "Three"];
  
  //add the proper header component that will be common to all pages
    return (
      <IonPage>
        <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Temporary Header</IonTitle>
        </IonToolbar>
      </IonHeader>

        <IonContent>

            <IonButton class="back-button" color="light">
                <IonIcon slot="icon-only" icon={arrowBackOutline}></IonIcon>
            </IonButton>

                <IonGrid>
                <IonRow class="ion-justify-content-center">
                    <h1>Settings</h1>
                    </IonRow>
                    <IonRow class="ion-justify-content-center">
                    <h1>{project}(project name)</h1>
                    </IonRow>
                    <IonRow class="ion-justify-content-center">
                        <IonCol size="6">
                            <SettingsTags tags={tags} />
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
  };
  
  export default SettingsPage;
  