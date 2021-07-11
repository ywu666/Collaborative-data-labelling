import {
  IonContent,
  IonPage,
  IonCard,
  IonCardTitle,
  useIonViewWillEnter,
  IonTitle,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-component';
import CircularProgress from '@material-ui/core/CircularProgress';
import './MainPage.css';
import 'firebase/auth';
import { projectServices } from '../services/ProjectServices';
import Header from '../components/Header';
import { userService } from '../services/UserServices';

interface MainPageProps {
  firebase: any;
}
const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
  const [projectNames, setProjectNames] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDisplayName, setCurrentDisplayName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

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
          localStorage.setItem('en_private_key', data.key.en_private_key)
        })
    } catch (e) {}
  }, [])

  function handleCreateProject(name:any) {
    setNewProjectName(name);
  }

  function handleLoading(load:boolean) {
    setLoading(load)
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
                  routerLink={'/project/' + data._id + '/labelling'}
                >
                  <IonCardTitle>{data.owner + ' / ' + data.name}</IonCardTitle>
                  {/*<IonCardContent>*/}
                  {/*  {progressProject(data)}*/}
                  {/*  <p>{progressMessage}</p>*/}
                  {/*</IonCardContent>*/}
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
    </IonPage>
  );
};

export default MainPage;