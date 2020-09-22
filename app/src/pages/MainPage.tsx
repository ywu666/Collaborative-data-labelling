import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonInput
  } from '@ionic/react';
  import { add, arrowBack} from 'ionicons/icons';
  import React, { useState, useEffect } from 'react';
  import './MainPage.css';
  import app from 'firebase/app';
  import 'firebase/auth';
  import firebase from "firebase";
  import { projectServices } from '../services/ProjectServices'
  import onLogout from '../helpers/logout'
  
  const MainPage: React.FC = () => {
    const [projectData, setProjectData] = useState([""]);
    useEffect(() => {
      try {
        projectServices.getProjectNames()
        .then(data => {
          setProjectData(data)
        })
      } catch (e) {
        
      }
    }, [])

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header">
            <IonTitle slot="end">User1</IonTitle>
            <IonButton onClick={onLogout} slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
          </IonToolbar>
        </IonHeader>

      <IonContent>
        <div className="container">
            {projectData.map((name, index) => (
                <IonCard key={index} routerLink={"/project/" + name}>
                    <IonCardTitle>
                            {name}
                    </IonCardTitle>
                    {/** current project backend api does not have project description
                    <IonCardContent >
                            {name.description}
                    </IonCardContent>
                    */}
                </IonCard>
            ))}
        </div>

        {/**will add an onclick function which will parse the new project name information to the system
         */}
        <form className="createProject">
          <IonItem>
            <IonLabel position="floating">New Project</IonLabel>
            <IonInput />
          </IonItem>
          <IonButton
            fill="outline"
            className="ion-margin-top"
            type="submit"
            expand="block"
          >
            <IonIcon icon={add} />
            Create
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
