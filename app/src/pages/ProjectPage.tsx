import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
} from '@ionic/react';
import { add, arrowBack, arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import { isNullOrUndefined } from 'util';
import * as request from 'request';
import MainPage from './MainPage';
import onLogout from '../helpers/logout'

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

const ProjectPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState(-1);
  const [documents] = useState(sampleDoc); //TODO: get documents via project id

  const renderLabelModal = (i:number) => {
    setShowModal(true)
    setLabelIndex(i)
  }

  const changeTag = (i:number, label:string) => {
    //TODO: connect with backend to update tags /
    documents[i].tag = label
    setShowModal(false)
  }

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
          <IonTitle slot="end">User</IonTitle>
          <IonButton onClick={onLogout} fill="clear" slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="container">        
          <h1>{name}</h1>
          <IonButton fill="outline" slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          <IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
            <div className="inner-content">
              {labels.map((label, i) =>
                <IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(labelIndex, label)}>{label}</IonButton>
              )}
            </div>
          </IonModal>
          <IonList>
            {documents.map((doc, i) =>
              <IonItem key={i}>
                <IonLabel>{doc.title}</IonLabel>
                {isNullOrUndefined(doc.tag) || doc.tag === ""
                  ? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(i)}><IonIcon icon={add}/></IonButton>
                  : <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(i)}>{doc.tag}</IonButton>
                }
              </IonItem>
            )}
          </IonList>
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
