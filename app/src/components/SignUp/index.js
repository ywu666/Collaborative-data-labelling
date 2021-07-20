import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import { css } from 'glamor';
import { Redirect } from "react-router-dom";
import { Button, Card, CardActions, CardContent, TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { IonSpinner } from '@ionic/react';
import { userService } from '../../services/UserServices'
import { EncryptedHelpers } from '../../helpers/encryption';

const SignUpPage = () => (
    <div>
        <SignUpForm />
    </div>
);

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

const INITIAL_STATE = {
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
    redirect: null,
    loading: false,
    encryptionKey: ''
};

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        this.setState({ loading: true });
        const { username, email, passwordOne, loading , encryptionKey} = this.state;

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                this.setState({ ...INITIAL_STATE });
                this.setState({ redirect: "/auth" });
                this.setState({ loading: false });

            }).then(() => {
                EncryptedHelpers.generateKeys(encryptionKey)
                  .then((keys) => {
                    this.props.firebase.auth.currentUser.getIdToken().then(idToken => {
                        localStorage.setItem("user-token", idToken);
                        userService.signup(username, email, idToken, keys)
                    })
                    this.setState({ loading: false });
                  }
                )
            })
            .catch(error => {
                this.setState({ error });
                this.setState({ loading: false });
            });

        event.preventDefault();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            error,
            loading,
           encryptionKey,
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '' ||
            encryptionKey === '';
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <Card >
                <CardContent>
                    <form onSubmit={this.onSubmit}>
                        <Typography variant="h5" component="h2">
                            Sign Up
                    </Typography>
                        <div {...lightPadding}>
                            <Typography color="textSecondary">
                                Verify your password.
                    </Typography>
                        </div>
                        <div {...lightPadding}>
                            <div {...inputBoxStyling}>
                                <TextField
                                    style={{ maxWidth: '400px', minWidth: '270px' }}
                                    name="username"
                                    value={username}
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="User Name"
                                />
                            </div>
                            <div {...inputBoxStyling}>
                                <TextField
                                    style={{ maxWidth: '400px', minWidth: '270px' }}
                                    name="email"
                                    value={email}
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Email Address"
                                />
                            </div>
                            <div {...inputBoxStyling}>
                                <TextField
                                    style={{ maxWidth: '400px', minWidth: '270px' }}
                                    name="passwordOne"
                                    value={passwordOne}
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Password"
                                />
                            </div>
                            <div {...inputBoxStyling}>
                                <TextField
                                    style={{ maxWidth: '400px', minWidth: '270px' }}
                                    name="passwordTwo"
                                    value={passwordTwo}
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Confirm Password"
                                />
                            </div>
                            <div {...inputBoxStyling}>
                                <TextField
                                  style={{ maxWidth: '400px', minWidth: '270px' }}
                                  name="encryptionKey"
                                  value={encryptionKey}
                                  onChange={this.onChange}
                                  onFocus={(e) => {
                                      var ps = document.getElementsByClassName('encryption')
                                      for(var x=0; x< ps.length; x++) {
                                          ps[x].style.visibility = 'visible'
                                      }
                                  }}
                                  type="password"
                                  placeholder="Confirm encryption key"
                                />
                                <p className='encryption' style={{visibility:'hidden'}}>Encryption is used to ensure the data is kept private from the tool maintainers.</p>
                                <p className='encryption' style={{visibility: 'hidden', color:'red'}}>Please remember your encryption key.</p>
                            </div>
                            <div {...inputBoxStyling}>
                                <CardActions>
                                    <Button color="primary" disabled={isInvalid} type="submit">
                                        Sign Up
                    {loading && <IonSpinner name="crescent" />}
                                    </Button>
                                </CardActions>
                            </div>


                            {error && <p>{error.message}</p>}
                        </div>
                    </form>
                </CardContent>
            </Card>

        );
    }
}

const SignUpLink = () => (
    <p>
        {/* Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link> */}
    </p>
);

const SignUpForm = compose(
    withFirebase,
)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };