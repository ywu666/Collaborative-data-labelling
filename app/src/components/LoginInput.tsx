import React, { useState } from 'react';
import { IonToast } from '@ionic/react';
import { SubmittableEmailInput } from './SubmittableEmailInput';

export enum LOGIN_STATUS {
  NONE,
  PENDING,
  SUCCESS,
  FAILED,
}

export const LoginInput: React.FC<{}> = () => {
  //const loggingIn = useSelector((state: { authentication: { loggingIn: any; }; }) => state.authentication.loggingIn);
  //const dispatch = useDispatch();
  const [] = useState({
    email: '',
    password: '',
  });

  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const [loginError, setLoginError] = useState<string>();

  const handleLogin = async (inputEmail: string, password: string) => {
    try {
      //await hit backend , persist later
      if (inputEmail && password) {
        //dispatch(userActions.login(user.email, user.password));
      }
    } catch (e) {
      setEmail('');
      setLoginError(e.message);
    }
  };

  return (
    <React.Fragment>
      <IonToast isOpen={!!loginError} message={loginError} duration={2000} />
      <SubmittableEmailInput
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        placeholderTextForEmail="Enter Email"
        placeholderTextForPassword="Enter Password"
        loading={false} //TODO: backend loading request
        submit={handleLogin}
        submitText="Login"
      />
    </React.Fragment>
  );
};
