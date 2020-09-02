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
  import { useParams } from 'react-router';
  import './MainPage.css';
    
  interface Document {
    title: string;
    tag: string;
  }
  
  const sampleDoc: Document[] = [
    {
      title: "first doc",
      tag: "",
    },
    {
      title: "second doc",
      tag: "tag1",
    },
    {
      title: "long title doc: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      tag: "tag1",
    },
  ]
  
  const labels: string[] = [
    "tag1",
    "tag2",
    "tag3",
  ]

  /**
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
  
  const ProjectPage: React.FC = () => {
  
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
  
  export default ProjectPage;