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

interface ProjectPageProps {
  firebase: any
}

const ProjectPage: React.FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const { id } = useParams<{ id: string }>();
  const [currentDisplayName,setCurrentDisplayName] = useState("");

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

  return (
    <IonPage className='ion-page-project-display'>
      <Header routerLink={"/"} name={currentDisplayName} />
      <ProjectHeader firebase={firebase}/>
        <Route exact path={`/project/${id}/labelling`}>
          <ProjectLabelling firebase={firebase} projectId={id}/>
        </Route>
        <Route exact path={`/project/${id}/insight`}>
          <ProjectInsight />
        </Route>
        <Route exact path={`/project/${id}/setting`} >
          <ProjectSettings firebase={firebase} projectId={id}/>
        </Route>
    </IonPage>
  );
};

export default ProjectPage;
