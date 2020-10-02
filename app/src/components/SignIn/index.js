import React, {useState, Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { css } from 'glamor';
import Typography from '@material-ui/core/Typography';
import { Redirect } from "react-router-dom";
import { refresh } from 'ionicons/icons';
import { IonSpinner, IonLabel } from '@ionic/react';
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
        <SignInForm />
    </div>
);

const INITIAL_STATE = {
    email: '',
    password: '',
    loggedIn:false,
    error: null,
    redirect: null,
    loading: false
};




class SignInFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        this.setState({ loading: true});
        console.log("button click")
 
            
        const { email, password, loggedin, loading } = this.state;
        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(user => {
                this.setState({ ...INITIAL_STATE});
                
            }).then(() => {
                this.props.firebase.auth.currentUser.getIdToken().then(idToken =>{
                    localStorage.setItem("email", email)
                    localStorage.setItem("user-token", idToken);
                    console.log(idToken)
                    
                    this.setState({loggedIn: true});
                    this.setState({ redirect: "/" });
                    this.setState({ loading: false});
                })
            })
            .catch(error => {
                this.setState({ error });
                this.setState({ loading: false});
            });
        
        event.preventDefault();
    };

    onChange = event => {
        console.log("change")
        this.setState({error: ''})
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, password, error, loading } = this.state;

        const isInvalid = email === '' || password === '';

        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <Card className={useStyles.root}>
                <CardContent>
                    <Typography className={useStyles.title} variant="h5" component="h2">
                        Sign In
                    </Typography>
                    <div {...lightPadding}>
                    <Typography className={useStyles.pos} color="textSecondary">
                        Verify your password.
                    </Typography>
                    </div>
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
                                <Button color="primary"  onClick={this.onSubmit} disabled={loading}>
                                    Sign In
                                    {loading && <IonSpinner name="crescent" />}
                                    
                                </Button>
                            </div>
                        </CardActions>
                        <div {...inputBoxStyling}>
                        <Typography className={useStyles.pos} color="textSecondary">
                        {error && <IonLabel color="danger">{error.message}</IonLabel>}
                        </Typography>
                        </div>

                    </div>
                    <div className="container">
                        <p>Don't have an account? <a href="http://localhost:3000/signup">Sign up here</a></p>
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

