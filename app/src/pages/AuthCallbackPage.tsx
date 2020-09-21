import React, { useState, useEffect, useCallback } from 'react';
import {
    IonPage,
    IonCard,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
  } from '@ionic/react';
  
  import { RouteComponentProps } from 'react-router';
  
  import { css } from 'glamor';
import SignInPage from '../components/SignIn';

  enum LOGIN_CARD_STATE {
    SHOW_LOGGING_IN,
    SHOW_LOGIN_SUCCESS,
    SHOW_SIGNUP_REDIRECT,
    SHOW_ERROR,
  }

  const AuthCallbackPage: React.FC<RouteComponentProps> = ({ history }) => {
    const [userToken, setUserToken] = useState<string>(
      localStorage.getItem('user-token')!
    );
    const [loginCardState, setLoginCardState] = useState<LOGIN_CARD_STATE>(
      LOGIN_CARD_STATE.SHOW_LOGGING_IN
    );

    return (
        <IonPage >
          <div className="ion-text-center">
            <h4 className="ion-padding-top">You're almost in!</h4>
            <IonCard >
              {renderAppropriateLoginCard(
                loginCardState,
                 userToken,
                 setUserToken
              )}
            </IonCard>
          </div>
        </IonPage>
      );
    };
    
    export default AuthCallbackPage;
    const renderAppropriateLoginCard = (
        cardState: LOGIN_CARD_STATE,
        userToken: string,
        setUserToken: React.Dispatch<React.SetStateAction<string>>
      ): JSX.Element => {
        switch (cardState) {
          case LOGIN_CARD_STATE.SHOW_LOGGING_IN:
            return <StatusTextCardContent status="Logging in..." />;
          case LOGIN_CARD_STATE.SHOW_LOGIN_SUCCESS:
            return <LoginSuccessCard />;
          case LOGIN_CARD_STATE.SHOW_SIGNUP_REDIRECT:
            return (
              <StatusTextCardContent status="We need some info from you. Redirecting you to the signup page." />
            );
          case LOGIN_CARD_STATE.SHOW_ERROR:
            return (
              <StatusTextCardContent status="Failed to login" />
            );
        }
      };

      const StatusTextCardContent: React.FC<{ status: string }> = ({ status }) => {
        return (
          <IonCardContent>
            <IonCardTitle>{status}</IonCardTitle>
            <IonSpinner />
          </IonCardContent>
        );
      };

      const EmailInputCardContent: React.FC<any> = ({
        email,
        setEmail,
        loading,
        submit,
      }) => {
        return (
          <IonCardContent>
            <SignInPage
            />
          </IonCardContent>
        );
      };

    export const LoginSuccessCard: React.FC = () => {
        return (
          <IonCardContent>
            <IonCardTitle>Logged in!</IonCardTitle>
          </IonCardContent>
        );
      };

    export const navigateToFeed = (userEmail?: string | null) => {
        setTimeout(() => {
          const navUser =
            userEmail ||
            localStorage.getItem('userEmail')
      
          window.location.href = `/${navUser}/posts`;
        }, 2000);
      };
      