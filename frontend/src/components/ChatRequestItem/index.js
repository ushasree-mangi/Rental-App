import { useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import './index.css'

const ChatRequestItem=(props)=>{ 



    const {chatRequestItemDetails, showChatView}=props 
    const {chatId,username,propertyTitle}=chatRequestItemDetails;
    var {status}=chatRequestItemDetails
    var [status,setStatus]=useState(chatRequestItemDetails.status)
   
    
    
    const changeChatStatus=async(chatId,statusText)=>{
        const token=Cookies.get("jwt_token")
           const url="http://localhost:4000/update-chat-status"
           const headers= {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            }
          const body={
            chatId,statusText
          }
        
          const response = await axios.put(url,body,{headers});
          setStatus(response.data.status)
         
       
    }

    const onClickSendMessage=()=>{
          showChatView(chatId, propertyTitle,username)
    }

    const onClickAccept=()=>{
        changeChatStatus(chatId, "accepted")
       
    }
    const onClickReject=()=>{
        changeChatStatus(chatId, "rejected")
       
    }

    
    return(
        <div className="request-card" key={chatId}>
                            <h3>Property Title: {propertyTitle}</h3>
                            <p>User name : {username}</p>
                            <p>Chat Request Status: {status}</p>
                            <button type="button" onClick={onClickAccept}>{status==="accepted"?"Accepted":"Accept"}</button>
                            <button type="button" onClick={onClickReject}>{status==="rejected"?"Rejected":"Reject"}</button>
                            {status==="accepted"&&<button onClick={onClickSendMessage} className='send-message-btn'>send message</button>}
                        </div>
    )

} 

export default ChatRequestItem;