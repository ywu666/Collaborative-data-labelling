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
import { arrowBack, arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import * as request from 'request';
import onLogout from '../helpers/logout'
import DocumentList from '../components/DocumentList'

const ProjectPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const page_size = 10
  const [pageIndex] = useState(0)

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
      <IonHeader>
        <IonToolbar className="header">
          <IonButton fill="clear" slot="start" routerLink="/" routerDirection="back">
            <IonIcon icon={arrowBack}/>
            </IonButton>
          <IonTitle slot="end">{localStorage.getItem("email")}</IonTitle>
          <IonButton onClick={onLogout} fill="clear" slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="container">        
          <h1>{name}</h1>
          <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          <DocumentList name={name} page={pageIndex} page_size={page_size}/>
        </div>
        <form className="uploadFile">
            <IonItem>
            <input type="file"  />
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
