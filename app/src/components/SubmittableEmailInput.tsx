import React from "react";
import { TextField } from '@material-ui/core';
import { IonButton, IonSpinner } from "@ionic/react";
import { css } from 'glamor';

const lightPadding = css({
  padding: '4px',
  flexWrap: 'wrap',
  width: '100%',
  maxWidth: '400px',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
});

const inputBoxStyling = css({
  margin: '0px 4px 40px 20px',
});

export interface SubmittableEmailInputProps {
    email?: string;
    setEmail: any;
    password?:string;
    setPassword: any;
    placeholderTextForEmail: string;
    placeholderTextForPassword: string;
    loading: boolean;
    submit: any;
    submitText: string;
  }

  export const SubmittableEmailInput: React.FC<SubmittableEmailInputProps> = ({
    email,
    setEmail,
    password,
    setPassword,
    placeholderTextForEmail,
    placeholderTextForPassword,
    loading,
    submit,
    submitText,
  }) => {
    const submitButtonDisabled = !email || loading;
  
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const isValid = email && !loading;
  
          if (!isValid) {
            return;
          }
          submit(email, password);
        }}
      >
        <div {...lightPadding}>
          <div {...inputBoxStyling}>
            <TextField
              variant="outlined"
              label={placeholderTextForEmail}
              value={email}
              type="email"
              style={{ maxWidth: '400px', minWidth: '270px' }}
              onChange={(e) => setEmail(e.target.value) }
            />
          </div>
  
          <div {...inputBoxStyling}>
            <TextField
              variant="outlined"
              label={placeholderTextForPassword}
              value={password}
              type="password"
              style={{ maxWidth: '400px', minWidth: '270px' }}
              onChange={(e) => setPassword(e.target.value) }
            />
          </div>

          <div {...inputBoxStyling}>
            <IonButton disabled={submitButtonDisabled} fill="solid" type="submit">
              {loading ? (
                <IonSpinner data-testid="email-submit-spinner" />
              ) : (
                submitText
              )}
            </IonButton>
          </div>
        </div>
      </form>
    );
};