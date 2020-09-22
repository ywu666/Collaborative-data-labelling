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

    // const [tags, setTags] = useState([""]);

    // const [users, setUsers] = useState([""]);
    // useEffect(() => {
    //   try {
    //     projectServices.getProjectUsers(project)
    //     .then(data => {
    //       setTags(data)
    //     })
    //   } catch (e) {
        
    //   }
    // }, [])
  
    // test tags data only! pass this in from database
    const tags: string[] = ["One", "Two", "Three"];
    const users: string[] = ["UserOne", "UserTwo", "UserThree"];
  
  //add the proper header component that will be common to all pages
    return (
      <IonPage>
        <IonHeader>
        <IonToolbar className="header">
          <IonButton slot="start" routerLink={"/project/" + project} routerDirection="back">
            <IonIcon icon={arrowBack}/>
            </IonButton>
          <IonTitle slot="end">User</IonTitle>
          <IonButton onClick={onLogout} slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
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
                <SettingsUsers users={users} />
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
  