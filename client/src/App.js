import React from 'react'
import { Box, Paper, Grid } from '@mui/material'

import requestUserData from './functions/RequestUserData'

import LoadingPage from './components/LoadingPage'
import UserPage from './components/UserPage'
import LoginPage from './components/LoginPage'

import './App.css'

function App() {
  const [isLoggedIn, setLogin] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)
  const [requestSent, setReqStat] = React.useState(false)

  const [userInfo, setUserInfo] = React.useState({})

  const boxClass = isLoading ? 'basket' : 'basket hide'

  if (!requestSent) {
    setReqStat(true)
    requestUserData((stat, userData) => {
      // console.log(stat)
      setLogin(stat)
      if (stat) {
        setUserInfo(userData)
      }
      setLoading(false)
    })
  }

  if (Notification.permission === "granted") {
    // var notification = new Notification("Hi there!")
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        let notification = new Notification("已接受消息通知")
      }
    })
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '50px',
          right: '50px',
          fontSize: '10px',
          opacity: 0.5
        }}
      >
        build #221009 {process.env.NODE_ENV === 'development' ? 'development' : 'production' } 
      </div>
      <Box
        className={boxClass}
      >
        <LoadingPage />
      </Box>
      {
        !isLoading && (
          <>
            {
              isLoggedIn ? (
                <UserPage />
              ) : (
                <LoginPage
                  setLogin={setLogin}
                />
              )
            }
          </>
        )
      }
    </>
  )
}

export default App