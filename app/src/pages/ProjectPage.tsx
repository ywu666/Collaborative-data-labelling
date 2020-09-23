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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText
} from '@ionic/react';
import { add, arrowBack, arrowUpOutline, arrowDownOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import app from 'firebase/app';
import 'firebase/auth';
import firebase from "firebase";
import { isNullOrUndefined } from 'util';
import * as request from 'request';
import MainPage from './MainPage';
import onLogout from '../helpers/logout'
import { documentServices } from '../services/DocumentService'

const labels: string[] = [
  "tag1",
  "tag2",
  "tag3",
]

interface ProjectPageProps {
  firebase: any
}

const ProjectPage: React.FC<ProjectPageProps> = (props:ProjectPageProps) => {
  const { name } = useParams<{ name: string }>();
  const {
    firebase
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState("");
  const [documents, setDocuments] = useState<any[]>([]); //TODO: get documents via project id
  const [document_ids, setDocumentsIds] = useState<any[]>([]);
  const [index, setIndex] = useState(0)

  useEffect(() => {
    try {
      documentServices.getDocumentIds(firebase, name, 0, 20)
      .then(data => {
        setDocumentsIds(data)
      })
    } catch (e) {
      
    }
  }, [])

  const getNextDocuments = (maximum:number) => {
    let i = 0;
    console.log(document_ids)
    for (let child of document_ids) {
      console.log(child)
      documentServices.getDocument(firebase, name, child._id)
      .then(data => {
        setDocuments(doc => [...doc, data])
      })
      i = i + 1;
      setIndex(index + 1)
      if(i > maximum) {
        break
      }
    }
  }

  useEffect(() => {
    getNextDocuments(20)
  }, [document_ids])

  const loadDocuments = (event:any) => {
    setTimeout(() => {
      console.log('Loaded data');



      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
    }, 500);
  }

  const [isLoading, setIsLoading] = useState(true);
  
  setTimeout(() => {
    setIsLoading(false);
  }, 1000)

  const renderLabelModal = (id:string) => {
    setShowModal(true)
    setLabelIndex(id)
  }

  const changeTag = (i:any, label:string) => {
    //TODO: connect with backend to update tags /
    //documents[i].tag = label
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

          {/**
          * skelenton is displayed if isLoading is true, otherwise document name is displayed
          */}
          {isLoading
          ?<IonList>
            <IonItem><IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText></IonItem>
            <IonItem><IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText></IonItem>
            <IonItem><IonSkeletonText animated style={{ width: '100%' }}></IonSkeletonText></IonItem>
          </IonList>   
          :<IonList>
            {documents.map((doc, index) =>
              <IonItem key={index}>
                <IonLabel>{doc.data}</IonLabel>
                {doc.user_and_labels.length === 0
                  ? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc.index)}><IonIcon icon={add}/></IonButton>
                  : <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc.index)}>{doc.user_and_labels[0].label}</IonButton>
                }
              </IonItem>
            )}
          </IonList>
          }
          
          <IonInfiniteScroll threshold="100px" onIonInfinite={(event) => loadDocuments(event)}>
            <IonInfiniteScrollContent
              loading-spinner="bubbles"
              loading-text="Loading more data...">
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>
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
