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
  name: string,
  logout?: boolean,
}

const Header: React.FC<HeaderProps> = (props:HeaderProps) => {
  const {
    routerLink,
    title,
		logout
  } = props;

  return (
    <IonHeader>
      <IonToolbar className="header" color="primary">
        {routerLink
        ? <IonButton fill="clear" slot="start" routerLink={props.routerLink??"/"} routerDirection="back" color="light">
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
        {logout === false
         ? <div/>
         : <IonButton onClick={onLogout} fill="clear" slot="end" routerLink="/auth" routerDirection="back" color="light">Log out</IonButton>}

      </IonToolbar>
    </IonHeader>
  )
}

export default Header;