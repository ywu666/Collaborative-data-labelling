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
  IonTextarea,
  IonInput,
  IonCard,
    IonCardContent,
    IonCardTitle,
} from '@ionic/react';
import { add, arrowBack, arrowUpOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import './DocumentPage.css';
import { isNullOrUndefined } from 'util';
import { projectServices } from '../services/ProjectServices'

interface Document {
  title: string;
  comments: string[];
  user_and_labels: string[][];
}

interface Users_and_Labels {
    email: string;
    label: string;
}


const labels: Users_and_Labels[] = [
    {
        email: "aaaa@aucklanduni.ac.nz",
        label: "tag1",
    },
    {
        email: "bbbb@aucklanduni.ac.nz",
        label: "tag1",
    }
]

var DocumentPage: React.FC = () => {
  const {document_id } = useParams<{document_id: string }>();
  const {project } = useParams<{project: string }>();
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState(-1);
//TODO: get documents via document id
  //const [users_and_labels] = useState(labels);

    const id_Token = localStorage.getItem("user-token")
    const [documentData, setDocumentData] = useState([[""]]);
    const [labelData, setLabelData] = useState([[""]]) //I dont think this is right

    useEffect(() => {
      try {
      console.log(project)
        projectServices.getDocument(project, document_id)
        .then(data => {

            data = JSON.parse(data)
            console.log(data)

            setDocumentData(data.data)
            console.log(data.user_and_labels)
            setLabelData(data.user_and_labels)

        })
      } catch (e) {

      }
    }, []);


console.log(labelData)
console.log(documentData)

  const renderLabelModal = (i:number) => {
    setShowModal(true)
    setLabelIndex(i)
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
      <IonHeader className="pageTitle">Document</IonHeader>
        <div className="container">
            <strong>{document_id}</strong>
            <IonCardTitle>
                {documentData}
            </IonCardTitle>
        </div>

        {/** I cant get this to work **/}
        {/**
        <div className="container">
          <IonList>
            {labelData.map((data, i) => (
                <IonItem key={i}>
                <IonLabel>{data.email}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>**/}

        <div className="container">
            <IonButton className="ion-margin-top" type="submit" expand="block">
                xxx
            </IonButton>

        </div>


      </IonContent>

    </IonPage>
  );
};

export default DocumentPage;
