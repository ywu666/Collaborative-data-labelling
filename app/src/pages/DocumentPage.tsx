import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardTitle,
  IonSkeletonText,
  IonCheckbox,
  IonAlert,
  IonSpinner,
} from '@ionic/react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import Moment from 'moment';
import './DocumentPage.css';
import { documentServices } from '../services/DocumentService';
import { userService } from '../services/UserServices';
import 'firebase/auth';
import Header from '../components/Header';
import NewCommentInput from '../components/NewCommentInput';
import Comment from '../components/Comment';
import { labelServices } from '../services/LabelServices';
import { stringify } from 'querystring';

interface Document {
  title: string;
  comments: string[];
  currentLoggedInConfirmed: boolean;
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
  const [popup, setPopup] = useState(false);
  const { firebase } = props;
  const [documentData, setDocumentData] = useState([['']]);
  const [labelData, setLabelData] = useState<Users_and_Labels[]>([]);
  const [labelList, setLabelList] = useState<Label[]>([]);
  const [list, setList] = useState<Users_and_Labels[]>([]);
  const [currentDisplayName, setCurrentDisplayName] = useState('');
  const [commentData, setCommentData] = useState<Comments[]>([]);
  const [isNotLabeled, setIsNotLabeled] = useState(true);
  const [labelLoading, setLabelLoading] = useState(true);
  const newCommentElement = useRef<HTMLIonTextareaElement>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [currentLabel, setCurrentLabel] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [displayId, setDisplayId] = useState<any>();
  const [hideConfirm, setHideConfirm] = useState(false);
  const [disabled, setDisabled] = useState<boolean>();
  const handleReply = (author: string) => {
    newCommentElement.current!.setFocus();
    newCommentElement.current!.value = `@${author} `;
  };

  useEffect(() => {
    setLabelLoading(true);
    documentServices
      .getIfCurrentUserConfirmedLabel(project, document_id, firebase)
      .then((data) => {
        if(data){
          setDisabled(data)
        }
        setChecked(data);
        setLabelLoading(false);
      })
      .catch((error) => {
        //handle the error of fetching labels
        let err = 'Error fetching label confirm';
        setError(err);
        setDisabled(true);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    documentServices
      .getLabels(project, firebase)
      .then((data) => {
        setLabelList(data);
      })
      .catch((e) => {
        let err = 'Error fetching labels';
        setError(err);
      });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    documentServices
      .getDocument(project, document_id, firebase)
      .then((data) => {
        setDocumentData(data.data);
        setDisplayId(data.display_id);
        setLabelData(data.user_and_labels);
        setCommentData(data.comments);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    labelData.forEach((element: any) => {
      labelList.forEach((element1: any) => {
        if (element.label === element1._id) {
          if (element.email == localStorage.getItem('email')) {
            setCurrentLabel(element1._id);
          }
          try {
            userService.getCurrentUser(element.email, firebase).then((data) => {
              let pair: Users_and_Labels = {
                email: data.username,
                label: element1.name,
              };
              setList((e) => [...e, pair]);
            });
          } catch (e) {}
        }
      });
    });
    if (labelData.length > 0) {
      setIsNotLabeled(false);
      if(labelData.length <2){
        setHideConfirm(true);
      }
    }
  }, [labelData, labelList]);

  useEffect(() => {
    try {
      userService
        .getCurrentUser(localStorage.getItem('email'), firebase)
        .then((data) => {
          setCurrentDisplayName(data.username);
        });
    } catch (e) {}
  }, []);

  useEffect(() => {
    userService.getCurrentProjectUser(project).then((data) => {
      setCurrentUser(data);
    });
  }, []);

  const onSubmitComment = (content: any) => {
    try {
      return documentServices
        .postNewComment(
          project,
          document_id,
          localStorage.getItem('email'),
          content,
          Moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
          firebase
        )
        .then(() => {
          documentServices
            .getDocument(project, document_id, firebase)
            .then((data) => {
              setCommentData(data.comments);
            });
        });
    } catch (e) {}
  };

  async function handleCheckedUpdate() {
    try {
      labelServices
        .updateConfirmedLabel(project, document_id, currentLabel, firebase)
        .then(() => {
          setDisabled(true);
          setChecked(true);
        })
        .catch((err) => {
          setError(stringify(err));
        });
    } catch (e) {}
  }

  async function handlePopuo() {
    setPopup(true);
  }

  return (
    <IonPage>
      <Header routerLink={'/project/' + project} name={currentDisplayName} />

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
            {!isLoading && (
              <IonAlert
                isOpen={popup}
                onDidDismiss={() => setPopup(false)}
                header={'Confirm your final label'}
                message={'You can not change the label once you confirm'}
                buttons={[
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {},
                  },
                  {
                    text: 'Okay',
                    handler: () => {
                      handleCheckedUpdate();
                    },
                  },
                ]}
              />
            )}
            <div className="pageTitle">
              Document ID: {displayId ? displayId : document_id}
            </div>
            <div className="documentContent">{documentData}</div>

            {currentUser.isContributor && !isLoading && !hideConfirm && (
              <div className="componentHeader">
                {labelLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                 <IonCheckbox
                    disabled={disabled}
                    color="danger"
                    onClick={handlePopuo}
                    checked={checked}
                    slot="start"
                  ></IonCheckbox>
                )}
                <IonLabel>
                  <h3>Confirm Your Label</h3>
                </IonLabel>
                {error && (
                  <IonLabel>
                    <h5>{error}</h5>
                  </IonLabel>
                )}
              </div>
            )}

            <div className="labelContainer">
              <IonList>
                <div className="componentHeader">
                  <IonItem>
                    <IonLabel>
                      <h2>Label</h2>
                    </IonLabel>
                    <IonLabel>
                      <h2>Assignee</h2>
                    </IonLabel>
                  </IonItem>
                </div>
                {list.map((data, i) => (
                  <IonItem key={i}>
                    <IonLabel>
                      <h3>{data.label}</h3>
                    </IonLabel>
                    <IonLabel>
                      <h3>{data.email}</h3>
                    </IonLabel>
                  </IonItem>
                ))}
                {isNotLabeled && !isLoading && (
                  <h5 className="promptMessage">
                    No labels have yet been set for this document
                  </h5>
                )}
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
