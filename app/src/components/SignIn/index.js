import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

const SignInPage = () => (
    <div>
        <h1>SignIn</h1>
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
            <div >
                <input
                    name="email"
                    value={email}
                    onChange={this.onChange}
                    type="text"
                    placeholder="Email Address"
                />
                <input
                    name="password"
                    value={password}
                    onChange={this.onChange}
                    type="password"
                    placeholder="Password"
                />
                <button disabled={isInvalid} onClick={this.onSubmit}>
                    Sign In
                </button>

                {error && <p>{error.message}</p>}
            </div>
        );
    }
}

const SignInForm = compose(
    withFirebase,
)(SignInFormBase);

export default SignInPage;

export { SignInForm };