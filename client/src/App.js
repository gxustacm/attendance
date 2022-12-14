import React from 'react'
import { Box } from '@mui/material'

import requestUserData from './functions/RequestUserData'

import LoadingPage from './components/LoadingPage'
import UserPage from './components/UserPage'
import LoginPage from './components/LoginPage'

import './App.css'

function App() {
  const [isLoggedIn, setLogin] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)
  const [requestSent, setReqStat] = React.useState(false)

  // const [userInfo, setUserInfo] = React.useState({})

  const boxClass = isLoading ? 'basket' : 'basket hide'

  if (!requestSent) {
    setReqStat(true)
    requestUserData((stat, userData) => {
      // console.log(stat)
      setLogin(stat)
      if (stat) {
        // setUserInfo(userData)
      } else {
        setLoading(false)
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
          opacity: 0.5,
          userSelect: 'none'
        }}
      >
        build #2210010@2 {process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}
      </div>
      <Box
        className={boxClass}
      >
        <LoadingPage />
      </Box>
      {
        isLoggedIn ? (
          <UserPage
            setLoading={setLoading}
          />
        ) : (
          <LoginPage
            setLogin={setLogin}
          />
        )
      }
    </>
  )
}

export default App