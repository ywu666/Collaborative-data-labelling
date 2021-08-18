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
  firebase: any,
  projectId:any,
}

const ProjectSettings: React.FC<ProjectSettingsProps> = (props: ProjectSettingsProps) => {
  const { id } = useParams<{ id: string }>();
  const {
    firebase,
    projectId,
  } = props;

  console.log('project setting projectId: ', projectId)

  return (
      <IonContent className="settings-page">
        <IonGrid className="settings-grid">
          <IonRow class="ion-justify-content-center">
            <h1>Settings</h1>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol size="12" size-md="10" size-lg="4" size-xl="4" class="settings-left">
              <SettingsTags projectId={projectId} firebase={firebase} />
            </IonCol>
            <IonCol size="12" size-md="10" size-lg="7" size-xl="7" class="settings-right">
              <SettingsUsers project={projectId} firebase={firebase} />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
  );
}

export default ProjectSettings;
