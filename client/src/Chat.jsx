import React, { useContext, useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from './assets/chat-animation.json';
import { UserContext } from './Context';
import { v4 as uuidv4 } from 'uuid'
import { uniqBy } from 'lodash';
import './Chat.css';
import axios from 'axios';
import Contact from './Contact';



const Chat = () => {
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({})
  const [newMessageText, setNewMessageText] = useState('');
  const [ws, setWs] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setLoggedInUsername } = useContext(UserContext);
  const messageBoxEnd = useRef()

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000');
      setWs(ws);

      ws.addEventListener('message', handleMessage);
      ws.addEventListener('close', () => {
        console.warn('WebSocket closed. Reconnecting...');
        setTimeout(connectWebSocket, 3000);
      });
      ws.addEventListener('error', () => {
        console.error('WebSocket error. Reconnecting...');
        ws.close();
      });
    };

    connectWebSocket();

    return () => {
      ws?.close();
    };
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messageBoxEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/api/messages/" + selectedUserId).then(res => {
        setMessages(res.data)
      })
    }
  }, [selectedUserId])

  useEffect(() => {
    axios.get('/api/users/people').then(res => {
      const offlineUsersArr = res.data.filter(p => p._id !== id && !Object.keys(onlineUsers).includes(p._id));
      const offlineUsers = {}
      offlineUsersArr.forEach(p => offlineUsers[p._id] = p)
      setOfflineUsers(offlineUsers)
    })
  }, [onlineUsers])




  function logout() {
    axios.post('/api/users/logout').then(() => {
      setId(null)
      setLoggedInUsername(null)
    })
  }

  function showOnlineUsers(users) {
    const userMap = {};
    users.forEach(({ userId, username }) => {
      userMap[userId] = username;
    });
    setOnlineUsers(userMap);
  }

  function handleMessage(ev) {
    const msgData = JSON.parse(ev.data);
    // console.log({ev,msgData})
    if ('online' in msgData) {
      showOnlineUsers(msgData.online);
    } else if ('text' in msgData) {
      if(messages.sender === selectedUserId){

        setMessages(prev => [...prev, { ...msgData }]);
      }
    }
  }




  function sendMessage(ev, file = null) {
    if (ev) {

      ev.preventDefault();
    }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file
    }));

    // setMessages(prev => [...prev, {
    //   text: newMessageText,
    //   sender: id,
    //   recipient: selectedUserId,
    //   _id: uuidv4()
    // }]);
    // setNewMessageText('');

    if (file) {
      axios.get("/api/messages/" + selectedUserId).then(res => {
        setMessages(res.data)
      })
    }else{
      setMessages(prev => [...prev, {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: uuidv4()
      }]);
      setNewMessageText('');
    }
  }

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0])
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result
      })
    }
  }

  const onlinePeopleExclOurUser = { ...onlineUsers };
  delete onlinePeopleExclOurUser[id];



  const messagesWithoutDupes = uniqBy(messages, '_id')
  // console.log('onlinePeopleExclOurUser:', onlinePeopleExclOurUser); // Debugging statement
  // console.log('offlineUsers:', offlineUsers);

  return (
    <div className='flex h-screen'>
      <div className="bg-white w-1/3 p-2 border rounded-sm flex flex-col">
        <div className='flex-grow'>
          <div className='text-blue-500 text-3xl font-bold flex items-center gap-2 mb-4'>
            <svg width="33px" height="33px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 9V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H7.2C6.0799 4 5.51984 4 5.09202 4.21799C4.71569 4.40973 4.40973 4.71569 4.21799 5.09202C4 5.51984 4 6.0799 4 7.2V18L8 16M20 20L17.8062 18.5374C17.5065 18.3377 17.3567 18.2378 17.1946 18.167C17.0507 18.1042 16.9 18.0586 16.7454 18.031C16.5713 18 16.3912 18 16.0311 18H11.2C10.0799 18 9.51984 18 9.09202 17.782C8.71569 17.5903 8.40973 17.2843 8.21799 16.908C8 16.4802 8 15.9201 8 14.8V12.2C8 11.0799 8 10.5198 8.21799 10.092C8.40973 9.71569 8.71569 9.40973 9.09202 9.21799C9.51984 9 10.0799 9 11.2 9H16.8C17.9201 9 18.4802 9 18.908 9.21799C19.2843 9.40973 19.5903 9.71569 19.782 10.092C20 10.5198 20 11.0799 20 12.2V20Z" stroke="#1e00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
            Pops
          </div>
          {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} />
          ))}
          {Object.keys(offlineUsers).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlineUsers[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId} />
          ))}
        </div>
        <div className='p-2 text-center flex items-center justify-between'>
          <span className='mr-2 text-sm text-gray-600 flex items-center gap-2'>
            <svg className='w-5 h-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button onClick={logout} className='bg-blue-100 text-gray-500 border px-2 py-1 rounded-md text-sm'>Logout</button>

        </div>
      </div>
      <div className={"bg-blue-100 w-2/3 flex flex-col p-2"}>
        <div className='flex-grow'>
          {!selectedUserId && (
            <div className='flex flex-col items-center justify-center gap-12 p-2 mt-5'>
              <span className='font-bold text-blue-500 text-3xl'>Select a Chat to start Texting</span>
              <Player autoplay loop src={animationData} style={{ marginTop: '2', height: '55%', width: '55%' }} />
            </div>
          )}
          {selectedUserId && (
            <div className='relative h-full'>
              <div className='overflow-y-scroll absolute inset-0 scrollable-container'>
                {messagesWithoutDupes.filter(message => (message.sender === id && message.recipient === selectedUserId) || (message.sender === selectedUserId && message.recipient === id))
                  .map((message, index) => (
                    <div key={index} className={`  ${message.sender === id ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 my-2  rounded-md ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                        {message.text}
                        {message.file && (
                          <div>
                            <a target='_blank' className='flex items-center gap-1 underline' href={axios.defaults.baseURL + '/uploads/' + message.file}>
                              <svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                              </svg>
                              {message.file}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                <div ref={messageBoxEnd} />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className={`flex gap-2 ${!selectedUserId ? 'hidden' : ''}`}>
          <input
            type="text"
            placeholder='Type your message here'
            className='bg-white p-2 flex-grow border rounded'
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
          />
          <label className='bg-blue-200 cursor-pointer p-2 rounded-sm border text-gray-600 border-blue-200'>
            <input className='hidden' type="file" onChange={sendFile} />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
            </svg>

          </label>
          <button type='submit' className='bg-blue-500 rounded-sm p-2'>
            <svg width="25px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M3.3938 2.20468C3.70395 1.96828 4.12324 1.93374 4.4679 2.1162L21.4679 11.1162C21.7953 11.2895 22 11.6296 22 12C22 12.3704 21.7953 12.7105 21.4679 12.8838L4.4679 21.8838C4.12324 22.0662 3.70395 22.0317 3.3938 21.7953C3.08365 21.5589 2.93922 21.1637 3.02382 20.7831L4.97561 12L3.02382 3.21692C2.93922 2.83623 3.08365 2.44109 3.3938 2.20468ZM6.80218 13L5.44596 19.103L16.9739 13H6.80218ZM16.9739 11H6.80218L5.44596 4.89699L16.9739 11Z" fill="#fefbfb"></path> </g></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
