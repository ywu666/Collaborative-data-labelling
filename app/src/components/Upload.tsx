import React, {useEffect, useRef, useState} from 'react';
import { projectServices } from "../services/ProjectServices";
import {Tooltip, Fab} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3880ff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

interface UploadProps {
  projectId: string;
  firebase: any;
  isUploading(val: boolean): any;
  uploadError(val: boolean, message: string): any;
  enable: boolean;
}

const Upload: React.FC<UploadProps> = (props:UploadProps) => {
  const {
    projectId,
    firebase,
    isUploading,
    uploadError,
    enable,
  } = props;
  const inputFile = useRef(null);
  const [upload, setUpload] = useState(false);

  useEffect(() => {
    if (upload === true) {
      try {
        isUploading(true);
        uploadError(false, "")

        // @ts-ignore
        projectServices.uploadDocuments(projectId, inputFile.current.files[0], firebase).then(data => {
          isUploading(false);
        }).catch(e => {
            uploadError(true, e);
            isUploading(false);
          })
      } catch (e) {}
      setUpload(false)
    }
  }, [upload])

  return (
    <Tooltip title={<h5>The uploaded file should be CSV formatted. There should
               only be one column, DOCUMENT.</h5>} placement="top">
      <label htmlFor="upload-button">
        <input
          style={{ display: 'none' }}
          id="upload-button"
          name="upload-button"
          type="file"
          accept=".csv"
          ref={inputFile}
          onChange={e => setUpload(true)}
        />

        <MuiThemeProvider theme={theme}>
          {enable ?
            <Fab color="primary" component="span" aria-label="add"> <AddIcon /> </Fab>
            : <Fab color="primary" disabled component="span" aria-label="add"> <AddIcon /> </Fab>}
        </MuiThemeProvider>

      </label>
    </Tooltip>
  );
}

export default Upload;

