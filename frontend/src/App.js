import {BrowserRouter,Route, Switch} from 'react-router-dom'

import ProtectedRoute  from './components/ProtectedRoute'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Home from './components/Home'
import ChatRequests from './components/ChatRequest';



import './App.css';


const App = () => (
  <>
  
  <BrowserRouter>
  
  <Switch>
    <Route exact path="/login" component={LoginForm} />
    <Route exact path="/register" component={RegisterForm} />
    <ProtectedRoute exact path="/" component={Home} />
    <ProtectedRoute exact path='/chat-requests' component={ChatRequests}/>
     
  </Switch>
  </BrowserRouter>
  </>
)

export default App;
