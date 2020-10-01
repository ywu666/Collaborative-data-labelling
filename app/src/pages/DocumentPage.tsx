import {
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardTitle,
  IonSkeletonText,
} from '@ionic/react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import Moment from 'moment';
import './DocumentPage.css';
import { documentServices } from '../services/DocumentService'
import { userService } from "../services/UserServices";
import firebase from "firebase";
import app from 'firebase/app';
import 'firebase/auth';
import Header from '../components/Header'
import NewCommentInput from '../components/NewCommentInput';
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
  const [isLoading, setIsLoading] = useState(true);
  const { firebase } = props;
  const [documentData, setDocumentData] = useState([['']]);
  const [labelData, setLabelData] = useState<Users_and_Labels[]>([]);
  const [labelList, setLabelList] = useState<Label[]>([]);
  const [list, setList] = useState<Users_and_Labels[]>([]);
  const [currentDisplayName,setCurrentDisplayName] = useState("");
  const [commentData, setCommentData] = useState<Comments[]>([]);
  const newCommentElement = useRef<HTMLIonTextareaElement>(null);

  const [error, setError] = useState("")

  const handleReply = (author: string) => {
    newCommentElement.current!.setFocus();
    newCommentElement.current!.value = `@${author} `;
  };

  useEffect(() => {
    documentServices.getLabels(project, firebase).then((data) => {
      setLabelList(data);
    })
    .catch(e => {
      let err = "Error fetching labels"
      setError(err)
    })
    ;
  }, []);

  useEffect(() => {
    documentServices
      .getDocument(project, document_id, firebase)
      .then((data) => {
        setDocumentData(data.data);
        setLabelData(data.user_and_labels);
        setCommentData(data.comments);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let temp: Users_and_Labels[] = []
    labelData.forEach((element: any) => {
      labelList.forEach((element1: any) => {
        if (element.label === element1._id) {
          let pair: Users_and_Labels = {
            email: element.email,
            label: element1.name,
          };
          temp.push(pair)
        }
      });
    });
    setList(temp)
  }, [labelData, labelList])

  useEffect(() => {
    try{
      userService.getCurrentLoggedInUser(localStorage.getItem("email"), firebase)
      .then(data => {
        setCurrentDisplayName(data.username)
      })
    } catch (e) {
      console.log(e)
    }
  }, [])

  const onSubmitComment = (content:any) => {
    try {
      return documentServices.postNewComment(project, document_id, localStorage.getItem('email'), content , Moment(new Date()).format("YYYY-MM-DD hh:mm:ss"), firebase)
      .then(() => { 
        documentServices.getDocument(project, document_id, firebase)
        .then((data) => {
          setCommentData(data.comments)
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <IonPage>
      <Header routerLink={"/project/" + project } name={currentDisplayName}/>

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
            <NewCommentInput
              inputRef={newCommentElement}
              onSubmit={onSubmitComment}
              disabled={false}
            ></NewCommentInput>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DocumentPage;
