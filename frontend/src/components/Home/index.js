
import Header from '../Header' 
import Cookies from 'js-cookie'
import PropertyCard from '../PropertyItem'
import axios from 'axios';
import { io } from 'socket.io-client';

import './index.css'
import { useState , useEffect } from 'react';

const Home =()=>{

   const [ propertiesArray ,setPropertiesArray] =useState([])

   useEffect(() => {
            const getProperties=async()=>{
                const token = Cookies.get('jwt_token')

                const url="http://localhost:4000/properties"
                
                const headers= {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    }
                
                
                const response = await axios.get(url,{headers});
                
               console.log(response.data)
                setPropertiesArray(response.data)
            }

    
        getProperties();

        // WebSocket connection
        

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

        // Listen for new product events
        socket.on('newProperty', (newProperty) => {
            setPropertiesArray((prevProducts) => [...prevProducts, newProperty]);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);
    
  
 
    
        return (
            <>
            <Header />
            <div className="home-page">
            <h1 className="home-heading">Home Page</h1>
            <div className="property-list">
                    <h2 className="properties-heading">Properties</h2>
                    <ul className="property-card-list">
                        {propertiesArray.map((eachItem)=>{
                
                    return <PropertyCard key={eachItem.propertyId} propertyDetails={eachItem}/>
                })}
                    </ul>
            </div>
        </div>
        </>
        ) 
  
}

export default Home
