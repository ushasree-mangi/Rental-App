import React from 'react';
import { useState,useEffect } from 'react';
import Header  from '../Header';
import axios from 'axios'
import { io } from 'socket.io-client';
import Cookies from 'js-cookie'
import ChatRequestItem from '../ChatRequestItem';
import Chat from '../Chat'
import './index.css';

const ChatRequests = () => {

    const [currentChatDetails,setCurrentChatDetails]=useState({})

     
    
    const [widthOfChatRequestsView, setWidthOfChatRequestsView] = useState("100%"); // Initial width in pixels
    const [requestsArray, setRequestsArray]=useState([])
  
    const [isShowChatView,setIsShowChatView]=useState(false)

    const showChatView=(chatId, propertyTitle,username)=>{
        setWidthOfChatRequestsView("60%")
            setIsShowChatView(true)
            setCurrentChatDetails({chatId, propertyTitle,username})

    }
    
    useEffect(()=>{

       const  getRequests=async()=>{

           const token=Cookies.get("jwt_token")
           const url="http://localhost:4000/get-chat-requests"
           const headers= {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            }
        
        
          const response = await axios.get(url,{headers});
         
          setRequestsArray(response.data)
       }
       getRequests();

      

       

       const socket = io('http://localhost:4000', {
        path: '/socket.io',  // Same WebSocket path as server
        transports: ['websocket', 'polling'], // Include polling
    });

    socket.on('connect', () => {
        console.log('Socket.IO connected');
      });
      
      socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
      });
      const userId=localStorage.getItem('userId');

     console.log(userId)
      socket.emit('registerUser', userId); // Register user with WebSocket

       // Listen for new product events
       socket.on('newChatRequest', (newChatRequest) => {
        console.log(newChatRequest)
        setRequestsArray((prevChatRequests) => [...prevChatRequests, newChatRequest]);
    });

      // Cleanup on component unmount
      return () => {
        socket.disconnect();
    };

    },[])

    return (
        <>
        <Header/>
        
        <div className="chat-page-container" >
            <div className="requests-section" style={{ width:{widthOfChatRequestsView} }}>
                <h2>All Requests</h2>
                <div className="requests-list">
                    {requestsArray.map((request) => (
                        <ChatRequestItem key={request.chatId} showChatView={showChatView} chatRequestItemDetails={request}/>
                        
                    ))}
                </div>
            </div>
            {isShowChatView&&<Chat currentChatDetails={currentChatDetails} />}
           
        </div>
       
        </>
    );
};

export default ChatRequests;
