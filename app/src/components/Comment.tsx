import {
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonToast,
  } from '@ionic/react';
  import React, { useEffect, useState } from 'react';
  import { timeOutline, heart, chatbox, star } from 'ionicons/icons';
  import { css } from 'glamor';
import { userService } from '../services/UserServices';
 
  export interface CommentProps{
    onReply: (author: string) => void;
    email:string;
    content: string;
    time:any;
    firebase:any
  }
  
  const timeLabelContainer = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '@media(min-width: 768px)': {
      position: 'absolute',
      right: '10px',
    },
  });
  
  const text = css({
    marginLeft: '20px',
    fontSize: '14px',
    whiteSpace: 'pre-line',
  });
  
  const Comment: React.FC<CommentProps> = (props: CommentProps) => {
    const {
      onReply,
      email,
      content,
      time,
      firebase
    } = props;
  
    const authorDisplayName = email? email : "No Name";
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        try{
          userService.getCurrentUser(email, firebase)
          .then(data => {
            setDisplayName(data.username)
          })
        } catch (e) {
          console.log(e)
        }
      }, [])
    //const unixTimestamp = 198784740;
    return (
      <>
          <IonGrid>
            <IonRow>
              <IonCol size-md="6" size-xs="12">
                <div>
                  <IonLabel>
                    <h6>
                      {displayName}
                    </h6>
                  </IonLabel>
                </div>
              </IonCol>
              <IonCol
                {...timeLabelContainer}
                size-md="auto"
                size-xs="12"
                offset-xs="0"
              >
                <IonIcon color="medium" icon={timeOutline} size="medium" />
                <IonLabel color="medium">
                  <h6>  {time} </h6>
                </IonLabel>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <p {...text}>{content}</p>
              </IonCol>
            </IonRow>
            <IonRow>
                  <IonButton
                    fill="clear"
                    expand="full"
                    color="medium"
                    onClick={() => onReply(displayName)}
                  >
                    <IonIcon color="medium" icon={chatbox} />
                  </IonButton>
            </IonRow>
          </IonGrid>
      </>
    );
  };
  
  export default Comment;