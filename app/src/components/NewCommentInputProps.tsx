import {
    IonCard,
    IonTextarea,
    IonCardContent,
    IonItem,
    IonGrid,
    IonRow,
    IonButton,
    IonSpinner,
    IonIcon,
    IonCol,
    IonToast,
  } from '@ionic/react';
  import React, { useState, RefObject } from 'react';
  import { send } from 'ionicons/icons';
  import Moment from 'moment';
  import { isNullOrWhitespace } from '../utils';
  import { documentServices } from '../services/DocumentService';
  export interface NewCommentInputProps {
    projectName: string;
    inputRef: RefObject<HTMLIonTextareaElement>;
    email:any;
    postId: string;
    //time:any
    firebase:any
  }
  
  const NewCommentInput: React.FC<NewCommentInputProps> = ({
   // onCommentCreated,
    projectName,
    inputRef,
    email,
    postId,
    //time,
    firebase
  }) => {
    const [content, setContent] = useState<string>();

    const handleSubmit = async () => {
      try {
        documentServices.postNewComment(projectName, postId, email, content , Moment(new Date()).format("YYYY-MM-DD hh:mm:ss"), firebase)
        .then(() => { 
			return documentServices.getDocument(projectName, postId, firebase)
        })
        //onCommentCreated(content);
        setContent('');
      } catch (e) {
        console.error(e);
      }
    };
  
    return (
      <>
        <IonCard className="ion-margin">
          <IonCardContent>
            {localStorage.getItem('email') ? (
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonTextarea
                        placeholder="Write a comment..."
                        value={content}
                        onIonChange={(e) => {
                          setContent(e.detail.value!);
                        }}
                        autofocus={true}
                        rows={5}
                        ref={inputRef}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol
                    className="ion-text-end"
                    style={{ padding: '0px' }}
                    size="12"
                  >
                    <IonButton
                      size="small"
                      disabled={isNullOrWhitespace(content) || !postId}
                      onClick={handleSubmit}
                    >
                        Submit
                      {/* {(loading && <IonSpinner />) || (
                        <>
                          Submit
                          <IonIcon size="small" slot="icon-only" icon={send} />
                        </>
                      )} */}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            ) : (
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="12" className="">
                    <h2>
                        'You must be logged in to comment'
                    </h2>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </IonCardContent>
        </IonCard>
      </>
    );
  };
  
  export default NewCommentInput;