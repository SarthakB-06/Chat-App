import React from 'react'
// import Register from './RegisterandLoginForm'
import { UserContext } from './Context'
import { useContext } from 'react'
import RegisterandLoginForm from './RegisterandLoginForm'
import Chat from './Chat'

const Routes = () => {
    const {username} = useContext(UserContext)
    console.log('Current username:', username)
    if(username){
        return <Chat/>;
    }
  return (
   <RegisterandLoginForm/>
  )
}

export default Routes
