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
import { arrowBack } from 'ionicons/icons';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import './DocumentPage.css';
import { documentServices } from '../services/DocumentService'
import firebase from "firebase";
import app from 'firebase/app';
import 'firebase/auth';
import onLogout from '../helpers/logout'
import Header from '../components/Header'
import NewCommentInput from '../components/NewCommentInputProps';
import Comment from '../components/Comment'

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
  firebase: any;
}

interface Label {
  _id: string;
  name: string;
}

interface Comments {
  email: string;
  comment_body: string;
  time: any;
}

var DocumentPage: React.FC<DocumentPageProps> = (props: DocumentPageProps) => {
  const { document_id } = useParams<{ document_id: string }>();
  const { project } = useParams<{ project: string }>();
  const [showModal, setShowModal] = useState(false);
  const [labelIndex, setLabelIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const { firebase } = props;
  const [documentData, setDocumentData] = useState([['']]);
  const [labelData, setLabelData] = useState<Users_and_Labels[]>([]);
  const [labelList, setLabelList] = useState<Label[]>([]);

  const [commentData, setCommentData] = useState<Comments[]>([]);
  const newCommentElement = useRef<HTMLIonTextareaElement>(null);

  const handleReply = (author: string) => {
    newCommentElement.current!.setFocus();
    newCommentElement.current!.value = `@${author} `;
  };

  useEffect(() => {
    try {
      documentServices.getLabels(project, firebase).then((data) => {
        setLabelList(data);
      });
    } catch (e) {}
  }, []);

  let list: Users_and_Labels[] = [];
  useEffect(() => {
    try {
      documentServices
        .getDocument(project, document_id, firebase)
        .then((data) => {
          setDocumentData(data.data);
          setLabelData(data.user_and_labels);
          setCommentData(data.comments);
          console.log(documentData)
          console.log(commentData)
          labelData.forEach((element: any) => {
            labelList.forEach((element1: any) => {
              if (element.label === element1._id) {
                let pair: Users_and_Labels = {
                  email: element.email,
                  label: element1.name,
                };
                list.push(pair);
              }
            });
          });
        });
    } catch (e) {}
  }, []);
  
  setTimeout(() => {
    setIsLoading(false);
  },
  1500
  )

  const renderLabelModal = (i: number) => {
    setShowModal(true);
    setLabelIndex(i);
  };

  return (
    <IonPage>
      <Header routerLink={"/project/" + project } name={localStorage.getItem("email") || "User"}/>

      <IonContent>
        {/**
         * skeleton is displayed if isLoading is true, otherwise projectData is displayed
         */}
        {isLoading ? (
          <div className="container">
            <IonCard>
              <IonCardTitle>
                <IonSkeletonText
                  animated
                  style={{ width: '100%' }}
                ></IonSkeletonText>
              </IonCardTitle>
            </IonCard>
            <IonCard>
              <IonCardTitle>
                <IonSkeletonText
                  animated
                  style={{ width: '100%' }}
                ></IonSkeletonText>
              </IonCardTitle>
            </IonCard>
            <IonCard>
              <IonCardTitle>
                <IonSkeletonText
                  animated
                  style={{ width: '100%' }}
                ></IonSkeletonText>
              </IonCardTitle>
            </IonCard>
          </div>
        ) : (
          <div className="container">
            <IonHeader className="pageTitle">Document</IonHeader>
            <div className="container">
              <IonCardTitle>{document_id}</IonCardTitle>
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
            <NewCommentInput
              projectName={project}
              inputRef={newCommentElement}
              email={localStorage.getItem('email')}
              postId={document_id}
              firebase={firebase}
            ></NewCommentInput>
            <IonList>
              {commentData.map((data, i) => (
                <IonItem key={i}>
                  <Comment
                    onReply={handleReply}
                    email={data.email}
                    content={data.comment_body}
                    time={data.time}
                  ></Comment>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DocumentPage;
