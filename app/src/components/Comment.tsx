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
  import React from 'react';
  import { timeOutline, heart, chatbox, star } from 'ionicons/icons';
  import Moment from 'react-moment';
  import firebaseApp from '../components/Firebase/firebase'
//   import { useMutation, useQuery } from '@apollo/react-hooks';
//   import { GET_LOCAL_USER } from '../common/graphql/localState';
//   import { GetLocalUser } from '../types/GetLocalUser';
  import { css } from 'glamor';
  export interface CommentData {
    id: string;
    creationTimestamp: number;
    content: string;
  }
  
  export interface CommentProps extends CommentData {
    onReply: (author: string) => void;
    documentIdForComment: string | undefined;
    isOriginalPoster?: boolean;
    author?: string;
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
      id,
      content,
      author,
      onReply,
      creationTimestamp,
      documentIdForComment,
    } = props;
  
    const authorDisplayName = author? author : "No Name";
    // const authorCommunity = author?.community?.abbreviation ?? '';
  
    // const localUserQuery = useQuery<GetLocalUser>(GET_LOCAL_USER, {
    //   fetchPolicy: 'network-only',
    // });
  
    const currentUser = localStorage.getItem('email');
    const unixTimestamp = 198784740;
    return (
      <>
          <IonGrid>
            <IonRow>
              <IonCol size-md="6" size-xs="12">
                <div>
                  <IonLabel>
                    <h6>
                      {authorDisplayName}
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
                  <h6>   <Moment unix>{unixTimestamp}</Moment> </h6>
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
                    onClick={() => onReply(authorDisplayName)}
                  >
                    <IonIcon color="medium" icon={chatbox} />
                  </IonButton>
            </IonRow>
          </IonGrid>
      </>
    );
  };
  
  export default Comment;