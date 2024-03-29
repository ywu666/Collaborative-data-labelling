import {
  IonContent,
  IonPage,
  IonCard,
  IonCardTitle,
  useIonViewWillEnter,
  IonTitle,
  IonCardContent,
  IonModal,
  IonButton,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-component';
import CircularProgress from '@material-ui/core/CircularProgress';
import './MainPage.css';
import 'firebase/auth';
import { projectServices } from '../services/ProjectServices';
import Header from '../components/Header';
import { userService } from '../services/UserServices';
import { useHistory } from "react-router-dom";
import { error } from 'console';
import { EncryptionServices } from '../services/EncryptionService';
import { EncryptedHelpers } from '../helpers/encryption';

interface MainPageProps {
  firebase: any;
}
const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
  const [projectNames, setProjectNames] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDisplayName, setCurrentDisplayName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showKeyPhrasePopup, setShowKeyPhrasePopup] = useState<boolean>(false);
  const [phrase, setPhrase] = useState<any>("");
  const [userKey, setUerKey] = useState<any>("");
  const [selectedId, setSelectedId] = useState<any>("");
  const [errorMsg, setErrorMsg] = useState<String>("");

  let history = useHistory();

  const {
    firebase
  } = props;

  useEffect(() => {
    setLoading(true)
    try {
      projectServices.getProjectNames(firebase)
        .then(data => {
          let loadings:any[] = []
          data.forEach((e: { name: string;}) => {
            let temp = {name:e.name, loading: true}
            loadings.push(temp)
          })
          setProjectLoading(loadings)
          setProjectNames(data)
        })
    } catch (e) {}
  },[newProjectName]);

  useEffect(() => {
    let temp = [...projectLoading]
    projectNames.forEach(e => {
      temp.forEach(e_p => {
        if (e_p.name === e.name) {
          e_p.loading = false
        }
      });
    });
    setProjectLoading(temp);
  }, [projectNames]);

  useEffect(() => {
    setLoading(projectLoading.some((e) => e.loading === true));
  }, [projectLoading]);

  
  useEffect(() => {
    try {
      userService.getCurrentUser(localStorage.getItem("email"), firebase)
        .then(data => {
          setCurrentDisplayName(data.username)
        })
    } catch (e) {}
  }, [])

  function handleCreateProject(name:any) {
    setNewProjectName(name);
  }

  function handleLoading(load:boolean) {
    setLoading(load)
  }

  async function handleProjectClick(data: any) {
    // check if public key exists 
    if ((localStorage.getItem('public_key') && localStorage.getItem('en_private_key') &&
         localStorage.getItem('hashPhrase') && data.encryption_state) || (!data.encryption_state)) {
      // change page 
      history.push('/project/' + data._id + '/labelling')
    }
    else {
      // key phrase not exists in local storage
      try {
        const userKey = await EncryptionServices.getUserKeys(firebase)
        if (userKey) {
          // ask for the same key phrase 
          setUerKey(userKey);
        }
        setSelectedId(data._id);
        setShowKeyPhrasePopup(true);
      }
      catch {
        setSelectedId(data._id);
        setShowKeyPhrasePopup(true);
      }
    }
  }

  function handleProvideKeyPhrase(e: any) {
    e.preventDefault();

    if (userKey) {
      // user has the key, check if the given phrase is the same as the previous one 
      const hashPhrase = EncryptedHelpers.generateHashPhrase(phrase, userKey.salt);

      try {
        EncryptedHelpers.decryptEncryptedPrivateKey(userKey.en_private_key, hashPhrase);

        // correct hash phrase provided 
        localStorage.setItem('public_key', userKey.public_key);
        localStorage.setItem('en_private_key', userKey.en_private_key);
        localStorage.setItem('hashPhrase', hashPhrase);
        setShowKeyPhrasePopup(false);
        history.push('/project/' + selectedId + '/labelling');

      } catch {
        setErrorMsg("Incorrect key phrase");
      }
    }
    else {
      // generate all the required keys for the user using the new phrase 
      EncryptedHelpers.generateKeys(phrase).then(userKey => {
        EncryptionServices.storeCurrentUserkey(userKey, firebase).then(r => {
          localStorage.setItem('public_key', userKey.public_key);
          localStorage.setItem('en_private_key', userKey.en_private_key);
          setShowKeyPhrasePopup(false);
          history.push('/project/' + selectedId + '/labelling');
        })
      })
    }
  }

  return (
    <IonPage>
      <Header
        name={currentDisplayName}
        firebase={firebase}
        iniProjectNames={projectNames}
        handleCreateProject={handleCreateProject}
        handleLoading={handleLoading}
      />

      {/**will add an onclick function which will parse the new project name information to the system
       */}

      <IonContent>
        <IonTitle color='primary' style={{margin:'10px'}}>Projects</IonTitle>
        <div className="container">
          <Masonry options={{ columnWidth: '.projectCard', percentPosition: true }}>
            {projectNames.map((data, index) => {
              return (
                <IonCard
                  key={index}
                  className="projectCard"
                  onClick={() => handleProjectClick(data)}
                >
                  <IonCardTitle>{data.owner + ' / ' + data.name}</IonCardTitle>
                  <IonCardContent>
                    <IonTitle color='primary' size='small'>{
                      data.encryption_state && 'Encrypted'
                    } </IonTitle>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </Masonry>
          {loading ? (
            <div>
              {' '}
              <CircularProgress />
            </div>
          ) : (
            <div />
          )}
        </div>
      </IonContent>

      {/*Asking for key phrase window */}
      <IonModal
        isOpen={showKeyPhrasePopup}
        cssClass='createProject'
        onDidDismiss={() => {
          setShowKeyPhrasePopup(false);
          setErrorMsg("");
          setPhrase("");
        }}
        backdropDismiss
      >
        <form
          onSubmit={(e: React.FormEvent) => {
            handleProvideKeyPhrase(e)
          }}
          style={{ 'margin': '50px', 'height': '100%' }}
        >
          <IonItem>
            <p className='encryption' >Please provide the key phrase used to encrypt and decrypt the project.
            </p>
          </IonItem>
          <IonItem>
            {
              userKey ? <p>Please enter the key phrase that you previously provided.</p> : 
              <p>
                Encryption is used to ensure the data is kept private from the tool maintainers.
                <IonText color="danger"><a>You must remember the encryption phrase.</a></IonText>
              </p>
            }
          </IonItem>
          <IonItem>
            <IonInput
              placeholder="Enter the phrase to encrypt data"
              value={phrase}
              name="encryptPhrase"
              id="encryptPhrase"
              onIonChange={(e) =>
                setPhrase(e.detail.value)
              }
              type="password"
            />
          </IonItem>
          <IonButton
            fill="outline"
            type="submit"
            expand="block"
          >CREATE</IonButton>
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        </form>
      </IonModal>

      
    </IonPage>
  );
};

export default MainPage;