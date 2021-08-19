import {
  IonPage} from '@ionic/react';
import React, {useEffect, useState, } from 'react';
import { Route, Switch, useParams } from 'react-router';
import './ProjectPage.css';
import Header from '../components/Header'
import { userService } from "../services/UserServices";
import ProjectHeader from '../components/Project/ProjectHeader'
import ProjectInsight from '../components/Project/ProjectInsight';
import ProjectLabelling from '../components/Project/ProjectLabelling';
import ProjectSettings from '../components/Project/ProjectSettings';
import { projectServices } from '../services/ProjectServices';

interface ProjectPageProps {
  firebase: any
}

const ProjectPage: React.FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const { id } = useParams<{ id: string }>();
  const [currentDisplayName,setCurrentDisplayName] = useState("");
  const [encryptStatus, setEncryptStatus] = useState(false)

  const {
    firebase
  } = props;

  useEffect(() => {
    try{
      userService.getCurrentUser(localStorage.getItem("email"), firebase)
      .then(data => {
        setCurrentDisplayName(data.username)
      })
    } catch (e) {
    }
  }, [])

  useEffect(() => {
    try{
     projectServices.getDescriptionOfAProject(firebase,id)
        .then(data => {
          setEncryptStatus(data.encryption_state)
        })
    } catch (e) {
    }
  }, [])

  return (
    <IonPage className='ion-page-project-display'>
      <Header routerLink={"/"} name={currentDisplayName} />
      <ProjectHeader firebase={firebase}/>
      <Switch>
        <Route exact path={`/project/${id}/labelling`}>
          <ProjectLabelling firebase={firebase} projectId={id} encryptStatus={encryptStatus}/>
        </Route>
        <Route exact path={`/project/${id}/insight`}>
          <ProjectInsight />
        </Route>
        <Route exact path={`/project/${id}/setting`}>
          <ProjectSettings />
        </Route>
      </Switch>
    </IonPage>
  );
};

export default ProjectPage;
