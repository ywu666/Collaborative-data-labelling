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
import React, { useState } from 'react';
import { useParams } from 'react-router';
import './ProjectPage.css';
import { isNullOrUndefined } from 'util';
  
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header">
          <IonButton slot="start"><IonIcon icon={arrowBack}/></IonButton>
          <IonTitle slot="end">User</IonTitle>
          <IonButton slot="end">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="container">        
          <strong>{name}</strong>
          <IonModal cssClass="auto-height" isOpen={showModal} onDidDismiss={e => setShowModal(false)}>
            <div className="inner-content">
              {labels.map((label, i) =>
                <IonButton key={i} slot="start" onClick={() => changeTag(labelIndex, label)}>{label}</IonButton>
              )}
            </div>
          </IonModal>      
          <IonList>
            {documents.map((doc, i) =>
              <IonItem key={i}>
                <IonLabel>{doc.title}</IonLabel>
                {isNullOrUndefined(doc.tag) || doc.tag === ""
                  ? <IonButton slot="end" onClick={() => renderLabelModal(i)}><IonIcon icon={add}/></IonButton>
                  : <IonButton slot="end" onClick={() => renderLabelModal(i)}>{doc.tag}</IonButton>
                }
              </IonItem>
            )}
          </IonList>
        </div>
        <form className="uploadFile">
            <IonItem>
            <input type="file" />
            </IonItem>
            <IonButton className="ion-margin-top" type="submit" expand="block"><IonIcon icon={arrowUpOutline}/>
                upload
            </IonButton>
        </form>
      </IonContent>

    </IonPage>
  );
};

export default ProjectPage;
