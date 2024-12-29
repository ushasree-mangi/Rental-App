import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import {Link} from 'react-router-dom' 
import Navbar from '../Navbar'

//import { io } from 'socket.io-client';

import './index.css'

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    showApiStatusText: false,
    apiStatusText: '',
    showPassword:false,
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitSuccess = data => {
    const {history} = this.props
    const {userId,jwtToken}=data

   

    localStorage.setItem("userId",userId)

    /* const socket = io('http://localhost:4000', {
            path: '/socket.io',  // Same WebSocket path as server
            transports: ['websocket', 'polling'], // Include polling
        });
    
        socket.on('connect', () => {
            console.log('Socket.IO connected');
          });
          
          socket.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err);
          });
    
    
          console.log(userId)
          socket.emit('registerUser', userId); // Register user with WebSocket*/

    Cookies.set('jwt_token', jwtToken, {
      expires: 10,
      path: '/',
    }) 
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({showApiStatusText: true,
      apiStatusText: errorMsg})
  }

  toggleShowPassword = () => {
    this.setState((prev) => ({showPassword : !prev.showPassword}))
  };

  submitForm = async event => {
    event.preventDefault()
    const {username, password} = this.state
    const userDetails = {username, password}
    this.setState({showApiStatusText:true,
      apiStatusText:"verifying...."
    })
    const url = 'http://localhost:4000/login'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    }
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok === true) {
      this.onSubmitSuccess(data)
    } else {
      this.onSubmitFailure(data.errorMsg)
    }
  }

  renderPasswordField = () => {
    const {password,showPassword} = this.state
    return (
      <>
        <label className="input-label" htmlFor="password">
          PASSWORD
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          className="password-input-field"
          value={password}
          onChange={this.onChangePassword}
        />
        <div className='checkbox-container'>
          <input  className='password-checkbox'
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={this.toggleShowPassword}
              /> 
              Show Password
          </div>
      </>
    )
  }

  renderUsernameField = () => {
    const {username} = this.state
    return (
      <>
        <label className="input-label" htmlFor="username">
          USERNAME
        </label>
        <input
          type="text"
          id="username"
          className="username-input-field"
          value={username}
          onChange={this.onChangeUsername}
        />
      </>
    )
  }

  render() {
    const {showApiStatusText, apiStatusText} = this.state
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }
    return (<>
    <Navbar/>
      <div className="login-form-container">
        <div>
       
        </div>
        <form className="form-container" onSubmit={this.submitForm}>
           <h1>Login</h1>
          <div className="input-container">{this.renderUsernameField()}</div>
          <div className="input-container">{this.renderPasswordField()}</div>
          <button type="submit" className="login-button">
            Login
          </button>
          {showApiStatusText && <p className="error-message">*{apiStatusText}</p>}
          <p className='account-note-text'>Don't have an account ? <Link to="/register" className="highlight-text"><span >Register here</span></Link></p>
        </form>
      </div></>
    )
  }
}

export default LoginForm
