import {
    IonItem,
    IonButton,
    IonList,
    IonListHeader,
    IonAlert,
  } from '@ionic/react';
import React, {useState} from 'react';
import './SettingsTags.css';

interface ContainerProps {
  tags: string[];
}

const SettingsTags: React.FC<ContainerProps> = ({ tags }) => {
    const [showNewTag, setShowNewTag] = useState(false);

  return (
    <div className="container">
      <h2>Tags</h2>
          {tags.map((tag, index) => {
            return (
            <IonButton size="small">{tag}</IonButton>
            );
          })}

        <IonButton size="small" color="light" fill="solid" onClick={() => setShowNewTag(true)}>
            + Add new tag
        </IonButton>

        <IonAlert 
        isOpen={showNewTag}
        onDidDismiss={() => setShowNewTag(false)}
        header={'Enter new name:'}
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
                text: 'Confirm'
            }
        ]}
        />
    </div>
  );
};

export default SettingsTags;
