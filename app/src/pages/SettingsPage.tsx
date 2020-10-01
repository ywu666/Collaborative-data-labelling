import {
    IonContent,
    IonPage,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  } from '@ionic/react';
  import React from 'react';
  import { useParams } from 'react-router';
  import SettingsTags from '../components/SettingsTags';
  import SettingsUsers from '../components/SettingsUsers';
  import Header from '../components/Header';
  
  import './SettingsPage.css';
  
  interface SettingsPageProps {
    firebase: any
  }
  const SettingsPage: React.FC<SettingsPageProps> = (props: SettingsPageProps) => {
    const { project } = useParams<{ project: string }>();
    const {
      firebase
    } = props;
  
    return (
      <IonPage>
        <Header routerLink={"/project/" + project} name={localStorage.getItem("email") || "User"}/>

        <IonContent className="settings-page">

          <IonGrid className="settings-grid">
            <IonRow class="ion-justify-content-center">
              <h1>{project} Settings</h1>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol size="12" size-md="10" size-lg="5" size-xl="6">
                <IonCard>
                <IonCardHeader><IonCardTitle>Project Tags</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <SettingsTags project={project} firebase={firebase} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" size-md="10" size-lg="7" size-xl="6">
                <IonCard>
                  <IonCardContent>
                    <SettingsUsers project={project} firebase={firebase} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  };
  
  export default SettingsPage;
  