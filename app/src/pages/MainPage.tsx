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

  // const progressProject = (data: any) => {
  //   let agreed_number = (data.agreed_number / data.analysed_number) * 100;
  //   if (data.total_number === 0) {
  //     return 'No documents in the project';
  //   } else if (
  //     isNullOrUndefined(data.unlabelled) &&
  //     data.analysed_number === 0
  //   ) {
  //     //You are not contributor when unlabelled is undefined
  //     return 'Labeling is incomplete by contributor(s)';
  //   } else if (!isNullOrUndefined(data.unlabelled) && data.unlabelled !== 0) {
  //     //contributor but still has labelling to do
  //     return 'Labeling not finished';
  //   } else if (data.analysed_number === 0) {
  //     // You are contributor but documents not analysed
  //     return 'Labeling is incomplete by other contributor';
  //   } else if (agreed_number < 1) {
  //     return 'Agreement score: ~0%';
  //   } else if (agreed_number > 99) {
  //     return 'Agreement score: ~100%';
  //   } else {
  //     return 'Agreement score: ' + Math.round(agreed_number).toString() + '%';
  //   }
  // }

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
    }
    else {
      // generate all the required keys for the user using the new phrase 
      EncryptedHelpers.generateKeys(phrase).then(userKey => {
        EncryptionServices.storeCurrentUserkey(userKey, firebase).then(r => {
          localStorage.setItem('public_key', userKey.public_key);
          localStorage.setItem('en_private_key', userKey.en_private_key);
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

      {/*Create project window */}
      <IonModal
        isOpen={showKeyPhrasePopup}
        cssClass='createProject'
        onDidDismiss={() => {
          setShowKeyPhrasePopup(false)
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
          {/* shows error messages when the key phrase is incorrect */}
          {/* {error && <p style={{ color: 'red' }}>{errorMessage}</p>} */}
        </form>
      </IonModal>

      
    </IonPage>
  );
};

export default MainPage;