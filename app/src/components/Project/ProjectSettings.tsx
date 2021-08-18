import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import SettingsTags from '../../components/SettingsTags';
import SettingsUsers from '../../components/SettingsUsers';
import { userService } from "../../services/UserServices";
import './ProjectSettings.css';


interface ProjectSettingsProps {
  firebase: any
}

const ProjectSettings: React.FC<ProjectSettingsProps> = (props: ProjectSettingsProps) => {
  const { project } = useParams<{ project: string }>();
  const {
    firebase
  } = props;

  // const [currentDisplayName, setCurrentDisplayName] = useState("");
  //
  // useEffect(() => {
  //   try{
  //     userService.getCurrentUser(localStorage.getItem("email"), firebase)
  //       .then(data => {
  //         setCurrentDisplayName(data.username)
  //       })
  //   } catch (e) {
  //   }
  // }, [])

  return (

      <IonContent className="settings-page">

        <IonGrid className="settings-grid">
          <IonRow class="ion-justify-content-center">
            <h1>{project} Settings</h1>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12" size-md="10" size-lg="4" size-xl="4" class="settings-left">
              <SettingsTags project={project} firebase={firebase} />
            </IonCol>
            <IonCol size="12" size-md="10" size-lg="7" size-xl="7" class="settings-right">
              <SettingsUsers project={project} firebase={firebase} />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
  );
}

export default ProjectSettings;
