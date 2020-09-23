import {
    IonContent,
    IonPage,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
  } from '@ionic/react';
  import { arrowBack } from 'ionicons/icons';
  import React, { useState, useEffect } from 'react';
  import { useParams } from 'react-router';
  import SettingsTags from '../components/SettingsTags';
  import onLogout from '../helpers/logout'
  import SettingsUsers from '../components/SettingsUsers';
  import { projectServices } from '../services/ProjectServices'
  
  import './SettingsPage.css';
  
  const SettingsPage: React.FC = () => {
    const { project } = useParams<{ project: string }>();

    const [tags, setTags] = useState([""]);
  
    return (
      <IonPage>
        <IonHeader>
        <IonToolbar className="header">
          <IonButton fill="clear" slot="start" routerLink={"/project/" + project} routerDirection="back">
            <IonIcon icon={arrowBack}/>
            </IonButton>
          <IonTitle slot="end">User</IonTitle>
          <IonButton onClick={onLogout} fill="clear" slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

        <IonContent>

          <IonGrid>
            <IonRow class="ion-justify-content-center">
              <h1>Settings</h1>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <h1>{project}</h1>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol size="6">
                <SettingsUsers project={project} />
              </IonCol>
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
  