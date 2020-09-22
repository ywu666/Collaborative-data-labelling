import 'firebase/auth';
/**
 * The project service encapsulates all backend api calls for performing CRUD operations on project data
 */
export const projectServices = {
    getProjectNames,
}

function getProjectNames(firebase: any) {
   const requestOptions = {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
   };
   
   return fetch(process.env.REACT_APP_API_URL + '/projects', requestOptions) // TODO:config.apiUrl
       .then(handleResponse)
       .then(data => {
           var token = localStorage.getItem('user-token');
           if(token != firebase.getIdToken()){
               console.log(firebase.getIdToken() + " not equal");
               localStorage.setItem('user-token',firebase.getIdToken())
           }
           return data.projects
       })
}

function handleResponse(response: { text: () => Promise<any>; ok: any; status: number; statusText: any; }) {
   return response.text().then((text: string) => {
       const data = text && JSON.parse(text);
       if (!response.ok) {
           const error = (data && data.message) || response.statusText;
           return Promise.reject(error);
       }

       return data;
   });
}