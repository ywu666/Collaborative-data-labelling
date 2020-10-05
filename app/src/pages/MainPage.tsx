import {
    IonContent,
    IonPage,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonInput,
  } from '@ionic/react';
  import { add } from 'ionicons/icons';
  import React, { useState, useEffect } from 'react';
  import Masonry from 'react-masonry-component'
  import CircularProgress from '@material-ui/core/CircularProgress';
  import './MainPage.css';
  import 'firebase/auth';
  import { projectServices } from '../services/ProjectServices'
  import { documentServices } from '../services/DocumentService';
  import Header from '../components/Header'
  import { isNullOrUndefined } from 'util';
  import { userService } from '../services/UserServices';
  
  interface MainPageProps {
    firebase: any
  }
  const MainPage: React.FC<MainPageProps> = (props: MainPageProps) => {
    const [projectNames, setProjectNames] = useState<any[]>([]);
    const [projectLoading, setProjectLoading] = useState<any[]>([]);
    const [projectData, setProjectData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDisplayName,setCurrentDisplayName] = useState("");
    const {
      firebase
    } = props;

    useEffect(() => {
      try {
        projectServices.getProjectNames(firebase)
        .then(data => {
          let loadings:any[] = []
          data.forEach((e: { name: string; }) => {
            let temp = {name:e, loading: true}
            loadings.push(temp)
          })
          setProjectLoading(loadings)
          setProjectNames(data)
        })
      } catch (e) {
        console.log(e)
      }
    }, [])

    useEffect(() => {
      projectNames.forEach(e => {
        documentServices.getNumberOfUnlabelledDocs(e)
        .then(data => {
          return data.find((_e: { email: string | null; }) => _e.email === localStorage.getItem("email"))?.number_unlabelled
        })
        .then(data => {
          if (isNullOrUndefined(data) || data === 0) {
            projectServices.getProjectAgreementScore(e, firebase)
            .then(_data => {
              _data.name = e
              _data.unlabelled = data
              if (projectData.some(e_p => e_p.name === _data.name)) {
                let temp = [...projectData]
                temp.forEach(e_t => {
                  if (e_t.name === _data.name) {
                    e_t = _data
                  }
                })
                setProjectData(temp)
              }
              else {
                setProjectData(e_p => [...e_p, _data])
              }
            })
          } else {
            let temp = { name: e, unlabelled:data }
            if (projectData.some(e_p => e_p.name === e)) {
              let temp_data = [...projectData]
              temp_data.forEach(e_t => {
                if (e_t.name === e) {
                  e_t = temp
                }
              })
              setProjectData(temp_data)
            }
            else {
              setProjectData(e_p => [...e_p, temp])
            }
          }
        })
      })
    }, [projectNames])

    useEffect(() => {
      let temp = [...projectLoading]
      projectData.forEach(e => {
        temp.forEach(e_p => {
          if (e_p.name === e.name) {
            e_p.loading = false
          }
        })
      })
      setProjectLoading(temp)
    }, [projectData])

    useEffect(() => {
      setLoading(projectLoading.some(e => e.loading === true))
    }, [projectLoading])
    
    function createProject(projectName: any){
      try {
        projectServices.createProject(projectName, firebase)

        setProjectNames(projectData => [...projectData, projectName]);
      } catch (e) {
        console.log(e)
      }    
    }

    const progressProject = (data: any) => {
      let agreed_number = data.agreed_number / data.analysed_number * 100
      if (data.total_number === 0) {
        return "No documents in the project"
      } else if (isNullOrUndefined(data.unlabelled) && data.analysed_number === 0) { //You are not contributor when unlabelled is undefined
        return "Labeling is incomplete by contributor(s)"
      } else if (!isNullOrUndefined(data.unlabelled) && data.unlabelled !== 0) {  //contributor but still has labelling to do
        return "Labeling not finished"
      } else if (data.analysed_number === 0) { // You are contributor but documents not analysed
        return "Labeling is incomplete by other contributor"
      } else if (agreed_number < 1) {
        return "Agreement score: ~0%"
      } else if (agreed_number > 99) {
        return "Agreement score: ~100%"
      } else {
        return "Agreement score: " + Math.round(agreed_number).toString() + "%"
      }
    }

    useEffect(() => {
      try{
        userService.getCurrentUser(localStorage.getItem("email"), firebase)
        .then(data => {
          setCurrentDisplayName(data.username)
        })
      } catch (e) {
        console.log(e)
      }
    }, [])
    return (
      
      <IonPage>
      <Header name={currentDisplayName}/>

      {/**will add an onclick function which will parse the new project name information to the system
         */}
          <form className="createProject" onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            createProject(formData.get("projectName"));
            formData.delete("projectName");
          }}>
            <IonItem>
              <IonLabel position="floating">New Project</IonLabel>
              <IonInput name="projectName" id="projectName" type="text"/>	            
            </IonItem>
            <IonButton fill="outline" className="ion-margin-top" type="submit" expand="block">	
            <IonIcon icon={add} />            
                create            
            </IonButton>	            
            </form>	 	     

      <IonContent>
        <div className="container">
          <Masonry 
            options={{columnWidth:".projectCard", percentPosition: true}}
          >
            {projectData.map((data, index) => {
              return (
                  <IonCard key={index} className="projectCard" routerLink={"/project/" + data.name}>
                    <IonCardTitle>
                      {data.name}
                    </IonCardTitle>
                    {/** current project backend api does not have project description
                    <IonCardContent >
                            {data.description}
                    </IonCardContent>
                    */}
                    <IonCardContent>
                      <p>{progressProject(data)}</p>
                    </IonCardContent>
                  </IonCard>
              )
            })}
          </Masonry>
          {loading
            ? <div> <CircularProgress/></div>
            : <div/>}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainPage;
