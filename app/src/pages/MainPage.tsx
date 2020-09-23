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
    IonInput,
    IonSkeletonText
  } from '@ionic/react';
  import { add, arrowBack} from 'ionicons/icons';
  import React, { useState, useEffect, useRef } from 'react';
  import './MainPage.css';
  import app from 'firebase/app';
  import 'firebase/auth';
  import firebase from "firebase";
  import { projectServices } from '../services/ProjectServices'
  import onLogout from '../helpers/logout'
  import Header from '../components/Header'
  
  interface MainPageProps {
    firebase: any
  }
  const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
    const [projectData, setProjectData] = useState([""]);
    const projectName = useRef(null);

    const {
      firebase
    } = props;
    const [isLoading, setIsLoading] = useState(true);

    
    useEffect(() => {

      try{
        projectServices.createProject("hello", firebase);
      } catch (e){
        console.log(e)
      }


      try {
        projectServices.getProjectNames(firebase)
        .then(data => {
          setProjectData(data)
        })
      } catch (e) {
        console.log(e)
      }



    }, [])

    setTimeout(() => {
      setIsLoading(false);
    }, 1500)

    return (
      <IonPage>
        <Header name={localStorage.getItem("email") || "User"}/>

      <IonContent>
        {/**
         * skelenton is displayed if isLoading is true, otherwise projectData is displayed
         */}
        {isLoading
        ?<div className="container">
          <IonCard>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
            </IonCardTitle>
          </IonCard>
          <IonCard>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
            </IonCardTitle>
          </IonCard>
          <IonCard>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText>
            </IonCardTitle>
          </IonCard>
        </div>
        :<div className="container">
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
        }


        {/**will add an onclick function which will parse the new project name information to the system
         */}

        <form className="createProject" onSubmit={() => {
          projectServices.createProject(projectName, firebase);
        }}>
            <IonItem>
                <IonLabel position="floating">New Project</IonLabel>
                <IonInput  ref={projectName} type="text"/>	            
            </IonItem>
            <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block">	
            <IonIcon icon={add} />            
                create            
            </IonButton>	            
        </form>	      
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
