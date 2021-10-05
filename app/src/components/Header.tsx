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
  IonCheckbox,
  IonTitle,
  IonText,
} from '@ionic/react';
import { add, addOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import onLogout from '../helpers/logout'
import './Header.css';
import { notificationsOutline } from 'ionicons/icons';
import { projectServices } from '../services/ProjectServices';
import { EncryptionServices } from '../services/EncryptionService';
import { EncryptedHelpers } from '../helpers/encryption';

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
  const [encryptionStatus, setEncryptionStatus] = useState(false);
  const [firstTimeEncrypt, setFirstTimeEncrypt] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [projectName, setProjectName] = useState<any>();
  const [phrase, setPhrase] = useState<any>();

  const {
    firebase
  } = props;

  useEffect(() => {
    if (newProject !== "") {
      try {
        // if its first time create a encrypted project, generate the user key for the user
        if(encryptionStatus && firstTimeEncrypt) {
          EncryptedHelpers.generateKeys(phrase).then(userKey => {
           EncryptionServices.storeCurrentUserkey(userKey, firebase).then(r => {
             setFirstTimeEncrypt(false);
             localStorage.setItem('public_key', userKey.public_key)
             localStorage.setItem('en_private_key', userKey.en_private_key)

             projectServices
               .createProject(newProject, firebase, encryptionStatus)
               .then((data) => {
                 if(props.handleCreateProject)
                   props.handleCreateProject(newProject)
                 // store the en_entry_key in an array in the localStorage

                 setShowCreateProject(false)
               })
               .catch((reason) => {
                 setError(true);
                 setErrorMessage(reason);
                 if(props.handleLoading)
                   props.handleLoading(false);
               });
           })
          })
        } else {
          projectServices
            .createProject(newProject, firebase, encryptionStatus)
            .then((data) => {
              if(props.handleCreateProject)
                props.handleCreateProject(newProject)
              // store the en_entry_key in an array in the localStorage

              setShowCreateProject(false)
            })
            .catch((reason) => {
              setError(true);
              setErrorMessage(reason);
              if(props.handleLoading)
                props.handleLoading(false);
            });

        }
      } catch (err) {
        setError(true);
        setErrorMessage(err.message);
        if(props.handleLoading)
          props.handleLoading(false);
      }
    }
  }, [newProject]);

  useEffect(() => {
    // check if its first time encrypted
    const checkFirstTime = async () => {
      if(firebase) {
        const userKey = await EncryptionServices.getUserKeys(firebase)
        if(userKey) {
          setFirstTimeEncrypt(false)
        }else {
          setFirstTimeEncrypt(true)
        }
      }
    }
    checkFirstTime().then();
  },[])

  const {
    routerLink,
    title,
    logout,
  } = props;

  function handleEnterProjectName (_value:any) {
    setProjectName(_value);
    setError(false);
    setErrorMessage('');
  }

  function handleEnterPhrase(_value:any) {
    setPhrase(_value)
    setError(false);
    setErrorMessage('')
  }

  function handleSubmit(e:React.FormEvent) {
    if(props.handleLoading)
      props.handleLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setNewProject(formData.get('projectName'));
    formData.delete('projectName');
    setProjectName("")
  }

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

      {/*Create project window */}
      <IonModal
        isOpen={showCreateProject}
        cssClass='createProject'
        onDidDismiss={() => {
          setShowCreateProject(false)
          setEncryptionStatus(false)
        }}
        backdropDismiss
      >
          <form
            onSubmit={(e: React.FormEvent) => {
              handleSubmit(e)
            }}
            style={{'margin':'50px', 'height':'100%'}}
          >
            <IonTitle >New Project</IonTitle>
            <IonItem>
              <IonInput
                placeholder="Enter Project Name"
                value={projectName}
                name="projectName"
                id="projectName"
                onIonChange={(e) =>
                  handleEnterProjectName(e.detail.value)
                }
                type="text"
              />
            </IonItem>
            <IonItem lines='none'>
              <IonLabel>Encrypt the project</IonLabel>
              <IonCheckbox
                slot='start'
                checked={encryptionStatus}
                onIonChange={e => setEncryptionStatus(e.detail.checked)}
                name='encryptionStatus'/>
          </IonItem>
          {
            encryptionStatus && firstTimeEncrypt &&
            <IonItem>
              <p style={{ color: 'red' }}>Please enter a key phrase to encrypt your data *</p>
            </IonItem>
          }
          { encryptionStatus && firstTimeEncrypt &&
            <IonItem>
              <IonInput
                placeholder="Enter the phrase to encrypt data"
                value={phrase}
                name="encryptPhrase"
                id="encryptPhrase"
                onIonChange={(e) =>
                  handleEnterPhrase(e.detail.value)
                }
                type="password"
              />
            </IonItem> }
            { encryptionStatus &&
            <IonItem>
              <p className='encryption' >Encryption is used to ensure the data is kept private from the tool maintainers.
                <IonText color="danger"><a>You must remember the encryption phrase.</a></IonText>
              </p>
            </IonItem> }
          <IonButton
            disabled={projectName == null || projectName.length < 1 || (firstTimeEncrypt && encryptionStatus && !phrase)}
            fill="outline"
            type="submit"
            expand="block"
            >CREATE</IonButton>
            { error && <p style={{color:'red'}}>{errorMessage}</p>}
          </form>
      </IonModal>
    </>
  )
}

export default Header;
