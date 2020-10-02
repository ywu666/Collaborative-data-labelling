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
  const [isNotLabeled, setIsNotLabeled] = useState(true);
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
    labelData.forEach((element: any) => {
      labelList.forEach((element1: any) => {
        if (element.label === element1._id) {
          try{
            userService.getCurrentUser(element.email, firebase)
            .then(data => {
              let pair: Users_and_Labels = {
                email: data.username,
                label: element1.name,
              };    
              setList(e => [...e, pair])
            })
          } catch (e) {
            console.log(e)
          }
        }
      });
    }
    );
    if (labelData.length > 0){
      setIsNotLabeled(false);
    }  
  }, [labelData, labelList])


  useEffect(() => {
    try{
      userService.getCurrentUser(localStorage.getItem("email"), firebase)
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
            <div className="pageTitle">Document ID: {document_id}></div>
              <div className="documentContent">
                {documentData}
              </div>


            <div className="labelContainer">
              <IonList>
                <div className="componentHeader">
                <IonItem>
                  <IonLabel><h2 >Label</h2></IonLabel>
                  <IonLabel><h2 >Assignee</h2></IonLabel>
                </IonItem>
                </div>
                 
                {
                }


                {list.map((data, i) => (
                  
                  <IonItem key={i}>
                    <IonLabel><h3>{data.label}</h3></IonLabel>
                    <IonLabel><h3>{data.email}</h3></IonLabel>
                  </IonItem>
                ))
                }
                  {isNotLabeled &&
                  <h5 className ="promptMessage">No labels have yet been set for this document</h5>
                  }

              </IonList>
            </div>


            <IonCard color="light">
            <h2 className="commentsTitle">Comments ({commentData.length})</h2>
            <NewCommentInput
              inputRef={newCommentElement}
              onSubmit={onSubmitComment}
              disabled={false}
            ></NewCommentInput>
            <IonList color="light">
              {commentData.map((data, i) => (
                <IonItem key={i} color="light">
                  <Comment
                    onReply={handleReply}
                    email={data.email}
                    content={data.comment_body}
                    time={data.time}
                    firebase={firebase}
                  ></Comment>
                </IonItem>
              ))}
            </IonList>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DocumentPage;
