import React, { Component } from 'react';
import { withFirebase} from '../Firebase';
import { compose } from 'recompose';
import { css } from 'glamor';
import { Redirect } from "react-router-dom";
import { Button, Card, CardActions, CardContent, CardHeader, TextField } from '@material-ui/core';

//import * as ROUTES from '../../constants/routes';

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
        textAlign: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
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
    redirect: null
};

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { username, email, passwordOne } = this.state;

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                this.setState({ ...INITIAL_STATE });
                this.setState({ redirect: "/auth" });
            })
            .catch(error => {
                this.setState({ error });
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
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            username === '';
            if (this.state.redirect) {
                return <Redirect to={this.state.redirect} />
            }
        return (
            <Card>
                <form onSubmit={this.onSubmit}>
                <div {...lightPadding}>
                <div {...inputBoxStyling}>
                <TextField
                    name="username"
                    value={username}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Full Name"
                />
                 </div>
                 <div {...inputBoxStyling}>
                <TextField
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Email Address"
                />
                  </div>
                  <div {...inputBoxStyling}>
                <TextField
                    name="passwordOne"
                    value={passwordOne}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                />
                </div>
                <div {...inputBoxStyling}>
                <TextField
                    name="passwordTwo"
                    value={passwordTwo}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Confirm Password"
                />
                </div>
                <CardActions>
                <Button disabled={isInvalid} type="submit">
                    Sign Up
                </Button>
                </CardActions>
                

                {error && <p>{error.message}</p>}
                </div>
            </form>
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