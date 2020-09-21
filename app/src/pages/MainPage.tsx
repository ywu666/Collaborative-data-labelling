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
    
    function onLogout() {
      firebase.auth().signOut().then(function() {
        localStorage.clear();
        console.log("Sign-out successful." + localStorage.getItem('user-token'))
      }).catch(function(error) {
        // An error happened.
      });
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header">
            <IonButton slot="start"><IonIcon icon={arrowBack}/></IonButton>
    <IonTitle slot="end">User1</IonTitle>
            <IonButton onClick={onLogout} slot="end">Log out</IonButton>
          </IonToolbar>
        </IonHeader>

        <IonHeader className="pageTitle">PROJECTS</IonHeader>
  
        <IonContent>
            
        <div className="container">
            {projectData.map((name, index) => (
                <IonCard key={index} routerLink={"/project/" + name}>
                    <IonCardTitle>
                            {name}
                    </IonCardTitle>
                    {/** current project backend api
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
            <IonButton className="ion-margin-top" type="submit" expand="block"><IonIcon icon={add}/>
                Create
            </IonButton>
        </form>
        
        </IonContent>

        

      </IonPage>
    );
  };
  
  export default MainPage;