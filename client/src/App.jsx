// import { UserContextProvider } from "./Context"

import axios from "axios"
import Routes from "./Routes"
import { UserProvider } from "./Context"

function App() {
  axios.defaults.baseURL = 'http://localhost:8000'
  axios.defaults.withCredentials = true

  return (
   <UserProvider>
      <Routes/>
   </UserProvider>
    
    
  )
}

export default App
