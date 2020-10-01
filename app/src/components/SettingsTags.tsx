import {
    IonButton,
    IonAlert,
  } from '@ionic/react';
  import React, { useState, useEffect } from 'react';
  import { labelServices } from '../services/LabelServices'
import './SettingsTags.css';

interface ContainerProps {
  project: string;
  firebase:any
}

const SettingsTags: React.FC<ContainerProps> = (props: ContainerProps) => {
    const [showNewTag, setShowNewTag] = useState(false);
    const {
      project,
      firebase
    } = props;
  const initialTags = [
    { _id: 0, name: '' }
  ]

  const [tags, setTags] = useState(initialTags);
  useEffect(() => {
    try {
      labelServices.getLabels(project, firebase)
      .then(data => {
        setTags(data)
      })
    } catch (e) {
      
    }
  }, [])

  function addTag(tag: string) {
    labelServices.setLabels(project, tag, firebase);
    setTags(tags => [...tags, { _id: 0, name: tag }])
  }

  return (
    <div className="container">
      {tags.map((tag) => {
        if (tag.name.length != 0) {
          return (
            <IonButton class="tag" key={tag.name} fill="outline" size="small">{tag.name}</IonButton>
          );
        }
      })}

        <IonButton size="small" fill="clear" onClick={() => setShowNewTag(true)}>
            + Add new tag
        </IonButton>

        <IonAlert 
        isOpen={showNewTag}
        onDidDismiss={() => setShowNewTag(false)}
        header={'Enter new name:'}
        message={''}
        inputs={[
            { 
            name: 'newTag',
            type: 'text',
            id: 'tagName',
            placeholder: 'New Tag' }
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (alertData) => {
              if (alertData.newTag.length > 0
                && !tags.some(check => check.name === alertData.newTag)) {
                addTag(alertData.newTag);
              } else {
                alert('Name is invalid');
                return false;
              }
            }
          }
        ]}
        />
    </div>
  );
};

export default SettingsTags;
