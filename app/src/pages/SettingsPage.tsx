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

    const [tags, setTags] = useState([""]);
  
    return (
      <IonPage>
        <Header routerLink={"/project/" + project} name={localStorage.getItem("email") || "User"}/>

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
                <SettingsUsers project={project} firebase={firebase} />
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol size="6">
                <SettingsTags project={project} firebase={firebase} />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  };
  
  export default SettingsPage;
  