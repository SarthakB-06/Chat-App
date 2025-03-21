import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [username, setLoggedInUsername] = useState('');
    const [id, setId] = useState(null);

    useEffect(()=>{
        axios.get("/api/users/profile").then(response =>{
            // console.log(response.data)
            setId(response.data.userId)
            setLoggedInUsername(response.data.username)
        })
    },[])

    return (
        <UserContext.Provider value={{ username, setLoggedInUsername, id, setId }}>
            {children}
        </UserContext.Provider>
    );
};