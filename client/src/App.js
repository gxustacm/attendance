import React, { useEffect } from 'react'
import { Box, Paper, Grid } from '@mui/material'

import requestUserData from './functions/RequestUserData'

import LoadingPage from './components/LoadingPage'

function App() {
  const [isLoggedIn, setLogin] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)
  const [requestSent, setReqStat] = React.useState(false)

  const [userInfo, setUserInfo] = React.useState({})

  useEffect(() => {
    // setLoading(false)
  }, [isLoggedIn, userInfo])

  if (!requestSent) {
    setReqStat(true)
    requestUserData(setLogin, setReqStat)
  }

  return (
    <>
      {
        isLoading ? (
          <>
            <LoadingPage />
          </>
        ) : (
          <>

          </>
        )
      }
    </>
  )
}

export default App