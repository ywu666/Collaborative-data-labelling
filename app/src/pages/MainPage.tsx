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
  import 'firebase/auth';
  import { projectServices } from '../services/ProjectServices'
  import Header from '../components/Header'
  
  interface MainPageProps {
    firebase: any
  }
  const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
    const [projectData, setProjectData] = useState([""]);

    const {
      firebase
    } = props;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

    function createProject(projectName: any){
      try {
        projectServices.createProject(projectName, firebase)

        setProjectData(projectData => [...projectData, projectName]);
      } catch (e) {
        console.log(e)
      }    
      
    }
    return (
      
      <IonPage>
      <Header name={localStorage.getItem("email") || "User"}/>

      {/**will add an onclick function which will parse the new project name information to the system
         */}
          <form className="createProject" onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            createProject(formData.get("projectName"));
            formData.delete("projectName");
          }}>
            <IonItem>
              <IonLabel position="floating">New Project</IonLabel>
              <IonInput name="projectName" id="projectName" type="text"/>	            
            </IonItem>
            <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block">	
            <IonIcon icon={add} />            
                create            
            </IonButton>	            
            </form>	 	     

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


         
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
