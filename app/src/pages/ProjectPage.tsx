import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonIcon,
} from '@ionic/react';

import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, {useRef, useState} from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import * as request from 'request';
import onLogout from '../helpers/logout'
import DocumentList from '../components/DocumentList'
import Header from '../components/Header'
import {projectServices} from "../services/ProjectServices";
import firebase from "firebase";

const ProjectPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const page_size = 10
  const [pageIndex] = useState(0)
  const inputFile = useRef(null);

  const downloadCSV = (projectName:string) => {
    request.get('https://localhost:5000/project/export?project=' + projectName, (response: any) => {
      const filename = 'labeller-' + projectName + '.csv'
      const blob = new Blob([response], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
  }

  return (
    <IonPage>
      <Header routerLink={"/"} name={localStorage.getItem("email") || "User"}/>

      <IonContent>
        <div className="container">        
          <h1>{name}</h1>
          <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          <DocumentList name={name} page={pageIndex} page_size={page_size}/>
        </div>
        <form className="uploadFile" onSubmit={() => {
          // @ts-ignore
          projectServices.uploadProjectDocuments(name, inputFile.current.files[0], firebase);
        }}>
            <IonItem>
            <input ref={inputFile} type="file" />
            </IonItem>
            <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block"><IonIcon icon={arrowUpOutline}/>
                upload
            </IonButton>
        </form>
        <form className="downloadFile">
            <IonButton fill="outline" className="ion-margin-top" type="button" expand="block" onClick={() => downloadCSV("projectName"/*need to pass the real project name/id here*/)}><IonIcon icon={arrowDownOutline}/>
                download
            </IonButton>
        </form>
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
