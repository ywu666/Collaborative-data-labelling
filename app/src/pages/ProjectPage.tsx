import {
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonIcon,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import DocumentList from '../components/DocumentList'
import Download from '../components/Download'
import Upload from '../components/Upload'
import Header from '../components/Header'
import { projectServices } from "../services/ProjectServices";
import { userService } from "../services/UserServices";
import { documentServices } from "../services/DocumentService"
import {Tooltip} from '@material-ui/core';

interface ProjectPageProps {
  firebase: any
}
const ProjectPage: React.FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const { name } = useParams<{ name: string }>();
  const page_size = 10;
  const [downloadError, setDownloadError] = useState<string>();
  const [currentUser, setCurrentUser] = useState<any>({});
  
  const {
    firebase
  } = props;


  useEffect(() => {
    userService.getCurrentProjectUser(name)
    .then(data => {
      setCurrentUser(data)
    })
  }, [])



  

  // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
    <IonPage>
      <Header routerLink={"/"} name={localStorage.getItem("email") || "User"}/>
      <IonContent>
        <div className="container">

            <h1>{name}</h1>


          {currentUser.isAdmin ? <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton> : <div/>}

        </div>
        <div>
          <DocumentList name={name} page_size={page_size} firebase= {firebase} currentUser={currentUser}/>
        </div>
        <div className="fab">
        <Upload name={name}/>
        <Download name={name}/>
        </div>


      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
