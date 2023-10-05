import {Amplify, Auth} from 'aws-amplify';
import amplifyConfig from './amplifyconfigure';

import './styles/auth.css';
// Configure Amplify
Amplify.configure(amplifyConfig);

const handleSignUp = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value; // If using email

    try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email // If using email
            }
        });
        console.log('Sign up success!', user);
        // Handle successful sign-up logic here
    } catch (error) {
        console.error('Error signing up:', error);
        // Handle errors or show messages to user
    }
};

const handleSignIn = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const user = await Auth.signIn(username, password);
        console.log('Sign in success!', user);
        // Ensuring the session is established before fetching it and redirecting.
        // await new Promise(resolve => setTimeout(resolve, 1000));  // wait for a second
        const session = await Auth.currentSession();
        console.log("session is", session);
    
        window.location.href = "main.html";
    } catch (error) {
        console.error('Error signing in:', error);
    }
};

// Attach event listeners
document.getElementById('signUpButton').addEventListener('click', handleSignUp);
document.getElementById('signInButton').addEventListener('click', handleSignIn);