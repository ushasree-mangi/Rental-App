import {Link, withRouter} from 'react-router-dom'
import {Component} from 'react'
import Cookies from 'js-cookie'

import './index.css'

class Header extends Component {

    state={
        username:""
    }

  onClickLogout = () => {
    const {history} = this.props
    Cookies.remove('jwt_token')
    history.replace('/login')
  }

  getProfileData=async()=>{
    try{ 
        const token = Cookies.get('jwt_token')
      
        
          if (token !== undefined) {
              const url="http://localhost:4000/user-profile"
              const options = {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                }
                
          }
          const response = await fetch(url, options)
          const data = await response.json()
          const {username}=data 
        
          this.setState({username:username})    
        }        
      }catch (error) {
        console.error(`Error fetching profile data:${error.message}`);
          }
  }
  
  componentDidMount() {
    this.getProfileData();
  }


  render(){ 
   const {username}=this.state
  return (
    <nav className="nav-header">
      <div className="nav-content">
       

        <div className="nav-bar-large-container">
          <Link to="/">
          <span className="shopper-logo-name">Sample App</span>
          </Link>
        
          <ul className="nav-menu">
            <li className="nav-menu-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>

            <li className="nav-menu-item">{username}</li>

            
            <li className="nav-menu-item">
              <Link to="/chat-requests" className="nav-link">
                Chat Requests
              </Link>
            </li>
          </ul>
          <button
            type="button"
            className="logout-desktop-btn"
            onClick={this.onClickLogout}
          >
            Logout
          </button>
        </div>
      </div>
     
     
    </nav>
  )}
}

export default withRouter(Header)
