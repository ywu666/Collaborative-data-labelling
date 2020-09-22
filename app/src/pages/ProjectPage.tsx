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
  const [document_ids, setDocumentsIds] = useState([""]);

  useEffect(() => {
    try {
      documentServices.getDocumentIds(name)
      .then(data => {
        setDocumentsIds(data)
      })
    } catch (e) {
      
    }
  }, [])

//  useEffect(() => {    
//    let result = [""];
//    for (let child of data) {
//      documentServices.getDocument(name, child._id)
//      .then(data => {
//        data._id = child._id
//        result.push(data)
//      }) 
//    }
//    setDocuments(result)
//  }, [])

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
            {documents.map(doc =>
              <IonItem key={doc._id}>
                <IonLabel>{doc.data}</IonLabel>
                {isNullOrUndefined(doc.user_and_labels)
                  ? <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}><IonIcon icon={add}/></IonButton>
                  : <IonButton fill="outline" slot="end" onClick={() => renderLabelModal(doc._id)}>{doc.user_and_labels[0]}</IonButton>
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
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
