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
    IonSkeletonText,
} from '@ionic/react';
import { add, arrowBack, arrowUpOutline } from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import './DocumentPage.css';
import { isNullOrUndefined } from 'util';
import { projectServices } from '../services/ProjectServices'
import firebase from "firebase";
import app from 'firebase/app';
import 'firebase/auth';
import onLogout from '../helpers/logout'

interface Document {
  title: string;
  comments: string[];
  user_and_labels: string[][];
}

interface Users_and_Labels {
    email: string;
    label: string;
}

interface DocumentPageProps {
    firebase: any
  }

interface Label {
    _id: string;
    name: string;
}

const users_and_labels_init: Users_and_Labels[] = [
    {
        email: "aaaa@aucklanduni.ac.nz",
        label: "tag1",
    },
    {
        email: "bbbb@aucklanduni.ac.nz",
        label: "tag1",
    }
]

const label_init: Label[] = [
    {
        _id: "123",
        name: "123"
    },
    {
        _id: "234",
        name: "234",
    }
]



var DocumentPage: React.FC<DocumentPageProps> = (props: DocumentPageProps) => {
  const {document_id } = useParams<{document_id: string }>();
  const {project } = useParams<{project: string }>();
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  const {
    firebase
  } = props;

    const id_Token = localStorage.getItem("user-token")
    const [documentData, setDocumentData] = useState([[""]]);
    const [labelData, setLabelData] = useState(users_and_labels_init)
    const [labelList, setLabelList] = useState(label_init)

    useEffect(() => {
      try {
        projectServices.getLabels(project, firebase)
        .then(data => {

            console.log(data)
            setLabelList(data)
            console.log(labelList)

        })
      } catch (e) {
        console.log(e)
      }
    }, []);

    useEffect(() => {
      try {
        projectServices.getDocument(project, document_id, firebase)
        .then(data => {
            console.log(data)

            setDocumentData(data.data)
            setLabelData(data.user_and_labels)
        })
      } catch (e) {
        console.log(e)
      }
    }, []);


    console.log(labelData)
    console.log(documentData)

    let list: Users_and_Labels[] = [];
    labelData.forEach((element:any) => {
       labelList.forEach((element1:any) => {
            if(element.label === element1._id){
                let pair: Users_and_Labels = {email: element.email, label: element1.name}
                list.push(pair)

            }
       })
    })
    console.log(list)
    setTimeout(() => {
      setIsLoading(false);
    },
    1500
    )

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
          <IonButton onClick={onLogout} slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
      {/**
         * skeleton is displayed if isLoading is true, otherwise projectData is displayed
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
            <IonHeader className="pageTitle">Document</IonHeader>
        <div className="container">

            <IonCardTitle>
                {document_id}
            </IonCardTitle>
            <strong>{documentData}</strong>
        </div>

        <div className="container">
          <IonList>
            {list.map((data, i) => (
                <IonItem key={i}>
                <IonLabel>{data.email}</IonLabel>
                <IonLabel>{data.label}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>

        <div className="container">
            <IonButton className="ion-margin-top" type="submit" expand="block">
                xxx
            </IonButton>

        </div>
        </div>
        }





      </IonContent>

    </IonPage>
  );
};

export default DocumentPage;
