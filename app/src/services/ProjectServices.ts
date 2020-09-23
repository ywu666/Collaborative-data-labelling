
import {downloadHelpers} from '../helpers/download'
/**
 * The project service encapsulates all backend api calls for performing CRUD operations on project data
 */
export const projectServices = {
    getProjectNames,
    exportCsv,
    getProjectUsers,
    setProjectUsers,
<<<<<<< HEAD
    setProjectTags,
    createProject
}

async function createProject(project_name: any, firebase: any){
    console.log("we made it");
    console.log(project_name);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify( {project_name} )
    }
    
    console.log(requestOptions);


    return fetch(process.env.REACT_APP_API_URL + '/projects/create?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
    .then(handleResponse)
    .then(data => {
        console.log("call for creating project reached back end")
        return data
=======
    createProject
}

async function createProject(projectName: any, firebase: any){
    console.log("We made it")
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify( {projectName} )
    }
       //await handleAuthorization(firebase);
   const token = localStorage.getItem('user-token');
   if(firebase.auth.currentUser != null){
    firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
        if(token !== idToken){
            localStorage.setItem('user-token',idToken)
        }
       })
   }else{
    window.location.href = '/auth';
   }

    return fetch(process.env.REACT_APP_API_URL + '/projects/create?id_token=' + localStorage.getItem('user-token'), requestOptions)
    .then(handleResponse)
    .then(data => {
        return data.projectName
>>>>>>> 625a7ea... create project Integration added
    })
}

async function getProjectNames(firebase: any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json', 
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
       "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
   };
   //await handleAuthorization(firebase);
   const token = localStorage.getItem('user-token');
   if(firebase.auth.currentUser != null){
    firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
        if(token !== idToken){
            localStorage.setItem('user-token',idToken)
            console.log("token ID was changed to match current user token ID")
        }
       })
   }else{
    window.location.href = '/auth';
   }

   return fetch(process.env.REACT_APP_API_URL + '/projects/all?id_token=' + localStorage.getItem('user-token'), requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {
           return data.projects
       })
}

function exportCsv(projectName: string) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 
        'Content-Disposition': 'attachment; filename=' + projectName + '-export.csv',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Content-Disposition, Access-Control-Allow-Headers, Authorization, X-Requested-With" },
    };
    const exportFields = ['ID', 'DOCUMENT', 'LABEL'];
    //const exportFields = ['id'];

    return fetch(process.env.REACT_APP_API_URL + '/projects/' + projectName +  '/export?id_token=' + localStorage.getItem('user-token'), requestOptions)
    //return fetch('https://picsum.photos/list', requestOptions)
    .then(handleResponse)
    .then(downloadHelpers.collectionToCSV(exportFields))
    .then(csv => {
        console.log(csv)
        const blob = new Blob([csv], {type: 'text/csv'});
        downloadHelpers.downloadBlob(blob, projectName + '-export.csv');
    })
    .catch(console.error);
}
async function getProjectUsers(project: string, firebase: any) {

    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With" }, 
    };

    const token = localStorage.getItem('user-token');
   if(firebase.auth.currentUser != null){
    firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
        if(token !== idToken){
            localStorage.setItem('user-token',idToken)
        }
       })
   }else{
    window.location.href = '/auth';
   }

    return fetch(process.env.REACT_APP_API_URL + 
        '/projects/' + project + '/users' + '?id_token=' + localStorage.getItem('user-token') + '&page=0&page_size=20',
        requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 async function setProjectUsers(project: string, user: string, firebase:any) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ user })
        };
    
        const token = localStorage.getItem('user-token');
        if(firebase.auth.currentUser != null){
         firebase.auth.currentUser.getIdToken().then((idToken: string) =>{
             if(token !== idToken){
                 localStorage.setItem('user-token',idToken)
             }
            })
        }else{
         window.location.href = '/auth';
        }

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/users/add' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 async function setProjectTags(project: string, label_name: string, firebase:any) {
    const requestOptions = {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ label_name })
     };

     const token = localStorage.getItem('user-token');
     if (firebase.auth.currentUser != null) {
         firebase.auth.currentUser.getIdToken().then((idToken: string) => {
             if (token !== idToken) {
                 localStorage.setItem('user-token', idToken)
             }
         })
     } else {
         window.location.href = '/auth';
     }

    return fetch(process.env.REACT_APP_API_URL +
        '/projects/' + project + '/labels/add' + '?id_token=' + localStorage.getItem('user-token'), requestOptions)
        .then(handleResponse)
        .then(data => {
            return data.users
        })
 }

 async function uploadDocuments(project : string, file : File, firebase: any){
    const formData = new FormData();

    formData.append("inputFile", file);
    formData.append("projectName", project);

    const requestOptions = {
        method : "POST",
        body : formData
    }
    await handleAuthorization(firebase)

     return fetch(process.env.REACT_APP_API_URL + '/projects/upload' + '?id_token=' +
         localStorage.getItem('user-token'), requestOptions)
         .then(handleResponse)
         .then(data => {
             return data.inputFile
         })

 }

function handleResponse(response: { text: () => Promise<any>; ok: any; status: number; statusText: any; }) {
    console.log(response)
   return response.text().then((text: string) => {
       const data = text && JSON.parse(text);
       console.log(data)
       if (!response.ok) {
           const error = (data && data.message) || response.statusText;
           return Promise.reject(error);
       }

       return data;
   });
}

export async function handleAuthorization(firebaseAuth: any) {
    const token = localStorage.getItem('user-token');
    if(firebaseAuth.auth.currentUser != null){
        firebaseAuth.auth.currentUser.getIdToken().then((idToken: string) =>{
         if(token !== idToken){
             localStorage.setItem('user-token',idToken)
         }
        })
    }else{
     window.location.href = '/auth';
    }
}
