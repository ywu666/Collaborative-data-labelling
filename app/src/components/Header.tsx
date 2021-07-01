import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonItem,
  IonPopover,
  IonLabel,
  IonInput,
  IonModal,
  IonCheckbox, IonTitle,
} from '@ionic/react';
import { add, addOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import onLogout from '../helpers/logout'
import './Header.css';
import { notificationsOutline } from 'ionicons/icons';
import { projectServices } from '../services/ProjectServices';

interface HeaderProps {
  firebase?: any,
  routerLink?: string,
  title?: string,
  name: string,
  logout?: boolean,
  iniProjectNames?:any[],
  handleCreateProject?:(names: any[]) => void;
  handleLoading?:(loading:boolean) => void;
}

const Header: React.FC<HeaderProps> = (props:HeaderProps) => {
  //states for headers
  const [searchText, setSearchText] = useState('');
  const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined });

  //states for the createProject popup window
  const [newProject, setNewProject] = useState<any>('');
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [owner, setOwner] = useState(null);
  const [initialEncryptionStatus, setInitialEncryptionStatus] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [text, setText] = useState<any>();
  const [encryptionKey, setEncryptionKey] = useState<any>();

  const {
    firebase,iniProjectNames
  } = props;

  useEffect(() => {
    if (newProject !== "") {
      try {
        projectServices
          .createProject(newProject, firebase)
          .then((data) => {
            if(props.handleCreateProject) props.handleCreateProject(newProject)
            setShowCreateProject(false)
          })
          .catch((reason) => {
            setError(true);
            setErrorMessage(reason);
            if(props.handleLoading) props.handleLoading(false);
          });
      } catch (err) {
        setError(true);
        setErrorMessage(err.message);
        if(props.handleLoading) props.handleLoading(false);
      }
    }
  }, [newProject]);

  const {
    routerLink,
    title,
    logout,
  } = props;

  function handleEnterProjectName (_value:any) {
    setText(_value);
    setError(false);
    setErrorMessage('');
  }

  function handleEnterEncryptionKey (_value:any) {
    setEncryptionKey(_value)
    setError(false);
    setErrorMessage('');
  }

  return (
    <>
      {/*Create project window */}

      <IonModal
        isOpen={showCreateProject}
        cssClass='createProject'
        onDidDismiss={() => setShowCreateProject(false)}
        backdropDismiss
      >
        <form
          onSubmit={(e: React.FormEvent) => {
            if(props.handleLoading) props.handleLoading(true);
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            setNewProject(formData.get('projectName'));
            formData.delete('projectName');
            setText("")
          }}
          style={{'margin':'10px','height':'100%'}}
        >
          <IonTitle >New Project</IonTitle>
          <IonItem>
            <IonInput
              placeholder="Enter Project Name"
              value={text}
              name="projectName"
              id="projectName"
              onIonChange={(e) =>
                handleEnterProjectName(e.detail.value)
              }
              type="text"
            />
         </IonItem>
          <IonItem lines='none'>
            <IonLabel>Encryption the project</IonLabel>
            <IonCheckbox
              slot='start'
              checked={initialEncryptionStatus}
              onIonChange={e => setInitialEncryptionStatus(e.detail.checked)}
              name='encryptionStatus'/>
          </IonItem>

          {/*{initialEncryptionStatus  &&*/}
          {/*<IonItem><IonInput*/}
          {/*  placeholder="Enter the key"*/}
          {/*  name='encryptionKey'*/}
          {/*  id='encryptionKey'*/}
          {/*  value={encryptionKey}*/}
          {/*  onIonChange={ (e) =>*/}
          {/*    handleEnterEncryptionKey(e.detail.value)*/}
          {/*  }*/}
          {/*  type='text'*/}
          {/*/>*/}
          {/*</IonItem>*/}
          {/*}*/}
          <IonButton
            disabled={text == null || text.length < 1}
            fill="outline"
            type="submit"
            expand="block"
          >CREATE</IonButton>
          {error && <p>{errorMessage}</p>}
        </form>
      </IonModal>

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
              style={{ width:"50%" }}/>
          }

          { logout === false
            ? <div/>
            : <div slot="end">
              <IonButton fill="clear"  color="light">
                <IonIcon icon={ notificationsOutline }/>
              </IonButton>
              <IonButton fill="clear"  color="light" onClick={(e) => setShowCreateProject(true)}>
                <IonIcon icon={ addOutline } />
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
