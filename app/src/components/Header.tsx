import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonItem,
  IonList,
  IonListHeader,
  IonPage,
  IonPopover,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import onLogout from '../helpers/logout'
import './Header.css';
import { notificationsOutline } from 'ionicons/icons';
import { red } from '@material-ui/core/colors';

interface HeaderProps {
  routerLink?: string,
  title?: string,
  name: string,
  logout?: boolean,
}

const Header: React.FC<HeaderProps> = (props:HeaderProps) => {
  const [searchText, setSearchText] = useState('');
  const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined });

  const {
    routerLink,
    title,
		logout,
  } = props;

  return (
    <>
    <IonHeader>
      <IonToolbar className="header" color="primary">
        {routerLink
        ? <IonButton style={{'--color': 'white'}} fill="clear" slot="start" routerLink={props.routerLink??"/"} routerDirection="back" color="light">
            <img src="assets/icon/icon.png"/>{title ? title :"Labeller"}
        </IonButton>
        : <IonButton style={{'--color': 'white','opacity':1}} fill="clear" slot="start" disabled>
            <img src="assets/icon/icon.png"/>{title ? title :"Labeller"}
          </IonButton>
        }

        { logout === false ? "":
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            slot="start"
            style={{width:"50%"}}/>
        }

        { logout === false
         ? <div/>
          : <div slot="end">
            <IonButton fill="clear"  color="light">
              <IonIcon icon={ notificationsOutline }/>
            </IonButton>
            <IonButton fill="clear"  color="light" >
              <IonIcon icon={ addOutline }/>
            </IonButton>
            <>
              <IonPopover
                showBackdrop={false}
                event={popoverState.event}
                isOpen={popoverState.showPopover}
                onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
              >
                <IonItem button onClick={onLogout} routerLink="/auth" routerDirection="back" >Log out</IonItem>
              </IonPopover>
              <IonButton fill="clear" color="light" onClick={
                (e: any) => { e.persist();setShowPopover({ showPopover: true, event: e })}} >
                {props.name}
              </IonButton>
          </>
        </div>
        }
      </IonToolbar>
    </IonHeader>


    </>
  )
}

export default Header;