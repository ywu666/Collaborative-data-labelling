import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { css } from 'glamor';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = css({
    root: {
      minWidth: 275,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });

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

const SignInPage = () => (
    <div>
        <h1>Sign In</h1>
        <SignInForm />
    </div>
);

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

class SignInFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        console.log("button click")
        const { email, password } = this.state;
        console.log(" staet Signed In!")
        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                console.log("Signed In!")
            }).then(() => {
                console.log(this.props.firebase.auth.currentUser.getIdToken());
            })
            .catch(error => {
                this.setState({ error });
                console.log("Error");
            });

        event.preventDefault();
    };

    onChange = event => {
        console.log("change")
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, password, error } = this.state;
       
        const isInvalid = password === '' || email === '';

        return (
            <Card className={useStyles.root}>
                 <CardContent>
            <div {...lightPadding}>
                <div {...inputBoxStyling}>
                    <TextField
                        name="email"
                        value={email}
                        onChange={this.onChange}
                        type="text"
                        style={{ maxWidth: '400px', minWidth: '270px' }}
                        placeholder="Email Address"
                    />
                </div>
                <div {...inputBoxStyling}>
                    <TextField
                        name="password"
                        value={password}
                        onChange={this.onChange}
                        type="password"
                        style={{ maxWidth: '400px', minWidth: '270px' }}
                        placeholder="Password"
                    />
                </div>
                <CardActions>
                <div {...inputBoxStyling}>
                    <Button color="primary" onClick={this.onSubmit}>
                        Sign In
                </Button>
                </div>
                </CardActions>
                {error && <p>{error.message}</p>}
            </div>
            </CardContent>
            </Card>
        );
    }
}

const SignInForm = compose(
    withFirebase,
)(SignInFormBase);

export default SignInPage;

export { SignInForm };