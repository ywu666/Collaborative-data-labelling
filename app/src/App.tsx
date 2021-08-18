import ProjectPage from './pages/ProjectPage';
import ProjectSettings from './components/Project/ProjectSettings';
import MainPage from './pages/MainPage';
import DocumentPage from './pages/DocumentPage';
import React from 'react';
import {useEffect, useRef, useState, useCallback} from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, IonSpinner, IonPage, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import Header from "./components/Header"
import './App.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

interface AppProps {
  firebase : any
}
const App: React.FC<AppProps> = (props: AppProps) => {
  const {
    firebase
  } = props
  const [loaded, setLoaded] = useState(false);

   firebase.auth.onAuthStateChanged(function(user: any) {
      setLoaded(true)
    });

  return (

    <IonApp>
        {loaded === false ?
            <IonPage>
            <Header name='' logout={false}/>

            <IonContent>
                <div className="pageInit">
                <IonSpinner className="spinner" name="crescent" color="primary"/>
                </div>
            </IonContent>
            </IonPage>

        : <IonReactRouter>
          <IonRouterOutlet id="main">
            <Route path="/project/:id" component={()=><ProjectPage firebase={firebase} />} />
            <Route path="/auth" component={LoginPage}  />
            <Route path="/signup" component={SignUpPage}  />
            <Route path="/" component={()=><MainPage firebase={firebase} />} exact />
            {/** I don't understand the purpose of this route and it doesn't redirect to anything
             * currently, for now I'm putting the MainPage as root,
             * idea brought up by Chuyang
             *
             * <Redirect from="/" to="/page/Inbox" exact />**/}
            <Route path="/project/:project/settings" component={()=><ProjectSettings firebase={firebase} />} exact />
            <Route path="/project/:project/document/:document_id" component={()=><DocumentPage firebase={firebase} />} exact />
          </IonRouterOutlet>
      </IonReactRouter>
        }

    </IonApp>
  );
};

export default App;
