import React, { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from './Context'

const RegisterandLoginForm = () => {
    const [username , setUsername] = useState('')
    const [isLoginOrRegister , setisLoginOrRegister] = useState('login')
    const [password , setPassword] = useState('')
    const {setLoggedInUsername , setId} = useContext(UserContext)
    async function handleSubmit(ev){
      ev.preventDefault();
      const url = isLoginOrRegister === 'register' ? '/api/users/register' : '/api/users/login';
      if (!username.trim() || !password.trim()) {
        alert("Please enter both a username and password.");
        return;
    }
    try {
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
    }
    }
  return (
    <div className='bg-blue-50 h-screen items-center justify-center flex mb-12' >
      <form className='w-64 mx-auto ' onSubmit={handleSubmit}>
        <input type="text" value={username} onChange={ev =>setUsername(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder="username" />
        <input type="password" value={password} onChange={ev =>setPassword(ev.target.value)} className='block w-full rounded-sm p-2 mb-2 border' placeholder='password' />
        <button className='bg-blue-500 text-white rounded-sm p-2 block w-full'>
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
        <div className='text-center mt-2'>{isLoginOrRegister === 'register' && (
        <div>
          Already a member?
          <button onClick={()=> setisLoginOrRegister('login')}><span className='text-blue-400'>Login here</span></button>
        </div>
        )} 
        {isLoginOrRegister === 'login' && (
          <div>
          Don't have an account? 
          <button onClick={()=> setisLoginOrRegister('register')}><span className='text-blue-400'>Register</span></button>
        </div>
        )}
        </div>
      </form>
    </div>
  )
}

export default RegisterandLoginForm
