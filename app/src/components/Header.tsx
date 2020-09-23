import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import React from 'react';
import onLogout from '../helpers/logout'
import './Header.css';

interface HeaderProps {
  routerLink?: string,
  title?: string,
  name: string
}

const Header: React.FC<HeaderProps> = (props:HeaderProps) => {
  const {
    routerLink,
    title,
		name
  } = props;

  return (
    <IonHeader>
      <IonToolbar className="header">
        {routerLink
        ? <IonButton fill="clear" slot="start" routerLink={props.routerLink??"/"} routerDirection="back">
          <IonIcon icon={arrowBack}/>
        </IonButton>
        : <img src="assets/icon/icon.png" slot="start"/>
        }
        <IonTitle slot="start">
          {title
            ?title
            :"Labeller"
          }
        </IonTitle>
        <IonTitle slot="end">{props.name}</IonTitle>
        <IonButton onClick={onLogout} fill="clear" slot="end" routerLink="/auth" routerDirection="back">Log out</IonButton>
      </IonToolbar>
    </IonHeader>
  )
}

export default Header;