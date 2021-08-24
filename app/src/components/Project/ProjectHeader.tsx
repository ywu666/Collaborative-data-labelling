import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonText, useIonViewWillEnter } from '@ionic/react';
import { analytics, folderOpen, pricetags, settings } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { projectServices } from '../../services/ProjectServices';
import { userService } from '../../services/UserServices';
import styles from './ProjectHeader.module.css';

interface ProjectHeaderProps {
    firebase: any
}

const ProjectHeader: React.FC<ProjectHeaderProps> = (props: ProjectHeaderProps) => {

    const { id } = useParams<{ id: string }>();
    const { firebase } = props;
    const [project, setProject] = useState({
        '_id': '',
        'owner': '',
        'name': '',
        'state': '',
        'encryption_state': ''
    });
    
    const [currentUser, setCurrentUser] = useState<any>({
        '_id': '',
        'isAdmin': false,
        'isContributor': false
    });

    useEffect(() => {
        try {
            projectServices.getDescriptionOfAProject(firebase, id)
                .then(data => {
                    setProject(data);
                })
        } catch (e) { 
            console.log(e);
        }
    }, [])

    useIonViewWillEnter(() => {
        userService.getCurrentProjectUser(id)
            .then(data => {
                setCurrentUser(data)
            })
    }, []);
    
    return (
        <div className={styles.projectDiv}>
            <div className={styles.headerDiv}>
                <IonIcon icon={folderOpen} className={styles.folderIcon}/>
                <IonText className={styles.projectName}>
                    {project.owner + "/" + project.name}
                </IonText>
            </div>

            <IonTabBar className={styles.tabBar}>
                <IonTabButton tab="tab1" href={`/project/${id}/labelling`} className={styles.tabButton}>
                    <IonIcon icon={pricetags} className={styles.tabIcon}/>
                    <IonLabel className={styles.tabLabel}>Labelling</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href={`/project/${id}/insight`} className={styles.tabButton}>
                    <IonIcon icon={analytics} className={styles.tabIcon}/>
                    <IonLabel className={styles.tabLabel}>Insight</IonLabel>
                </IonTabButton>
                <IonTabButton 
                    tab="tab3" href={`/project/${id}/setting`} 
                    className={styles.tabButton}
                    disabled={!currentUser.isAdmin}
                >
                    <IonIcon icon={settings} className={styles.tabIcon}/>
                    <IonLabel className={styles.tabLabel}>Settings</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </div>
    );
};

export default ProjectHeader;
