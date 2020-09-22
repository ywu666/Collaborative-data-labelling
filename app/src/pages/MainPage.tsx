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
  import React, { useState } from 'react';
  import './MainPage.css';
    
  /*
   * Temporary project data to display UI 
   */
  const projectData = [
    {
        title: "Project1",
        description:
            "Wellington, the capital of New Zealand, sits near the North Island’s southernmost point on the Cook Strait.",
    },
    {
        title: "Project2",
        description:
            "Auckland, based around 2 large harbours, is a major city in the north of New Zealand’s North Island.",
    },
];
  
  const MainPage: React.FC = () => {
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header">
            <IonButton slot="start"><IonIcon icon={arrowBack}/></IonButton>
            <IonTitle slot="end">Gay User</IonTitle>
            <IonButton slot="end">Log out</IonButton>
          </IonToolbar>
        </IonHeader>

        <IonHeader className="pageTitle">PROJECTS</IonHeader>
  
        <IonContent>
            
        <div className="container">
            {projectData.map((name, index) => (
                <IonCard key={index}>
                    <IonCardTitle>
                            {name.title}
                    </IonCardTitle>
                    <IonCardContent >
                            {name.description}
                    </IonCardContent>
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