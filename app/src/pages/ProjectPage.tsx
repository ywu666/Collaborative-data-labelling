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
  IonInfiniteScrollContent
} from '@ionic/react';
import { add, arrowBack, arrowUpOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import { isNullOrUndefined } from 'util';
import { documentServices } from '../services/DocumentService'

const labels: string[] = [
  "tag1",
  "tag2",
  "tag3",
]

const ProjectPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState("");
  const [documents, setDocuments] = useState<any[]>([]); //TODO: get documents via project id
  const [document_ids, setDocumentsIds] = useState<any[]>([]);

  useEffect(() => {
    try {
      documentServices.getDocumentIds(name)
      .then(data => {
        setDocumentsIds(data)
      })
    } catch (e) {
      
    }
  }, [])

  useEffect(() => {   
    let index = 0;
    for (let child of document_ids) {
      documentServices.getDocument(name, child._id)
      .then(data => {
        setDocuments(doc => [...doc, data])
      })
      index = index + 1;
      if(index > 20) {
        break
      }
    }
  }, [document_ids])


  const loadDocuments = (event:any) => {
    setTimeout(() => {
      console.log('Loaded data');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
    }, 500);
  }

  const renderLabelModal = (id:string) => {
    setShowModal(true)
    setLabelIndex(id)
  }

  const changeTag = (i:any, label:string) => {
    //TODO: connect with backend to update tags /
    //documents[i].tag = label
    setShowModal(false)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header">
          <IonButton fill="clear" slot="start" routerLink="/" routerDirection="back">
            <IonIcon icon={arrowBack}/>
            </IonButton>
          <IonTitle slot="end">User</IonTitle>
          <IonButton fill="clear" slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="container">        
          <h1>{name}</h1>
          <IonButton slot="end" routerLink={"/project/" + name + "/settings"}>Settings</IonButton>
          <IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
            <div className="inner-content">
              {labels.map((label, i) =>
                <IonButton fill="outline" key={i} slot="start" onClick={() => changeTag(labelIndex, label)}>{label}</IonButton>
              )}
            </div>
          </IonModal>
          <IonList>
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
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
