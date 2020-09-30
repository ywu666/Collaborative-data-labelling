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
  
  export interface NewCommentInputProps {
    inputRef: RefObject<HTMLIonTextareaElement>;
    onSubmit:any
    disabled:boolean
  }
  
  const NewCommentInput: React.FC<NewCommentInputProps>  = (props:NewCommentInputProps) => {
    const {
      inputRef,
      onSubmit,
      disabled
    } = props;

    const [content, setContent] = useState<string>();
    const [loading, setLoading] = useState(false);
  
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
                        autofocus={false}
                        rows={5}
                        ref={inputRef}
                        disabled={disabled}
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
                      {(loading && <IonSpinner />) || (
                        <IonButton
                          fill="outline"
                          size="small"
                          disabled={isNullOrWhitespace(content) || disabled}
                          onClick={() => {
                            setLoading(true)
                            onSubmit(content).then(() => {
                              setLoading(false)
                            })
                            setContent('')
                          }}
                        >
                          <IonIcon size="small" slot="icon-only" icon={send} />
                        </IonButton>
                      )}
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