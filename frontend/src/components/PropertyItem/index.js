import axios  from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'
import './index.css'

const PropertyCard=(props)=>{

    const {propertyDetails}=props
    
    const [isShowChatRequestStatus , setIsShowChatRequestStatus]=useState(false)

    const {propertyId,propertyTitle,price, description,status }=propertyDetails
    

    const sendChatRequest=async()=>{
        const token = Cookies.get('jwt_token')
        const url="http://localhost:4000/chat-request"
        const headers= {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            }
        
        const body={
                propertyId,
        }
       
        const response = await axios.post(url,body,{headers});
       if(response.status===201){
        setIsShowChatRequestStatus(true)
       }

    }
    const onClickChat=()=>{
        sendChatRequest()
    }

    return (
        

        <li className="property-card">
                    
                    <div className="property-details">
                        <h3><strong>Title : </strong>{propertyTitle}</h3>
                        <p><strong>Price:</strong> {price}</p>
                        <p><strong>Description:</strong> {description}</p>
                        <div className='connect-with-us-container'>
                            <p>connect with us :</p>
                            <button type='button' onClick={onClickChat}>Chat Request</button>
                            {isShowChatRequestStatus&&<p>Chat Request : {status}</p>}
                        </div>
                    </div>
        </li>

      
    )

}

export default PropertyCard