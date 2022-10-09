import React from 'react'
import { useEffect } from 'react'
import { Box, BottomNavigation, BottomNavigationAction, Snackbar, Alert, Typography, Button } from '@mui/material'
import { Attribution, Restore } from '@mui/icons-material'
import webSocket from 'socket.io-client'
import cookie from 'react-cookies'
import UserInfoPage from './UserInfoPage'

const UserPage = () => {
  const [ws, setWs] = React.useState(null)
  const [requestSent, setReqStat] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [showMsg, setMsg] = React.useState(false)
  const [duplicated, setDuplicated] = React.useState(false)
  const [disconnectMsg, setDisconnectMsg] = React.useState(false)
  const [disconnected, setDisconnected] = React.useState(false)
  const [dura, setDura] = React.useState(0)
  const [onlineData, setOnlineData] = React.useState([])
  const [user, setUser] = React.useState({})

  const connectWs = () => {
    if (process.env.NODE_ENV === 'development')
      setWs(webSocket('https://check.ixnet.icu/'))
    else
      setWs(webSocket('/'))
  }

  const date = new Date()
  //const weekStart = parseInt(date.getTime() / (24 * 60 * 60 * 1000) - date.getDay()) * 24 * 60 * 60 * 1000

  const initWebSocket = () => {
    ws.on('stat', msg => {
      if (msg === 'success') {
        setMsg(true)
        const timeStart = Date.parse(new Date())
        setInterval(() => {
          setDura(parseInt((Date.parse(new Date()) - timeStart) / 1000))
        }, 1000)
      }
      if (msg === 'duplicated') {
        setMsg(true)
        setDuplicated(true)
        ws.disconnect()
      }
    })

    ws.on('onlineData', msg => {
      setOnlineData(msg)
    })

    ws.on('userInfo', msg => {
      setUser(msg)
    })

    ws.on('disconnect', () => {
      setDisconnected(true)
      setDisconnectMsg(true)
      if (Notification.permission === "granted") {
        let notification = new Notification("连接已断开...")
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            let notification = new Notification("已接受消息通知")
          }
        })
      }
    })
  }

  const sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  useEffect(() => {
    const connect = async () => {
      if (ws && !duplicated) {
        initWebSocket()
        await sleep(500)
        var Tracker = {
          id: cookie.load('tracker-id'),
          token: cookie.load('tracker-token')
        }
        ws.emit('sign in', JSON.stringify(Tracker))
      }
    }
    connect()
  }, [ws])

  if (!requestSent) {
    setReqStat(true)
    connectWs()
  }

  const handleReconnect = () => {
    window.location.reload()
  }

  const format = (time) => {
    var h = parseInt(time / 3600)
    var m = parseInt((time % 3600) / 60)
    var s = parseInt(time % 60)
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
    // return Date.parse(new Date())
  }

  return (
    <>
      {
        page === 0 && (
          <Box
            sx={{
              position: 'fixed',
              margin: 'auto',
              left: '0',
              right: '0',
              marginTop: 'calc(50vh - 150px)',
              textAlign: 'center'
            }}
          >
            {disconnected ? (
              <>
                <Typography
                  variant='h1'
                  sx={{
                    color: 'red'
                  }}
                >
                  Disconnected
                </Typography>
                <Box 
                  sx={{
                    padding: '20px 0 0 0'
                  }}
                />
                <Button
                  variant='outlined'
                  onClick={handleReconnect}
                >
                  重新连接
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant='h1'
                >
                  {format(dura)}
                </Typography>
                <Typography
                  sx={{
                    color: 'green'
                  }}
                >
                  Online
                </Typography>
              </>
            )}
          </Box>
        )
      }
      {
        page === 1 && <UserInfoPage
          onlineData={onlineData}
          user={user}
        />
      }
      <Box
        sx={{
          position: 'fixed',
          left: '0',
          right: '0',
          bottom: '40px'
        }}
      >
        <BottomNavigation
          showLabels
          value={page}
          onChange={(e, v) => {
            setPage(v)
            if (v === 1) {
              ws.emit('queryOnlineData', { year: date.getFullYear() })
            }
          }}
        >
          <BottomNavigationAction
            label='计时器'
            icon={<Restore />}
          />
          <BottomNavigationAction
            label='我的'
            icon={<Attribution />}
          />
        </BottomNavigation>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showMsg}
        onClose={() => setMsg(false)}
        autoHideDuration={2000}
      >
        <Alert
          severity={
            duplicated ? 'warning' : 'success'
          }
        >
          {duplicated ? '连接已关闭，请勿打开多个窗口' : '已建立连接'}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={disconnectMsg && !duplicated}
        onClose={() => setDisconnectMsg(false)}
        autoHideDuration={2000}
      >
        <Alert
          severity='error'
        >
          连接意外关闭，请检查网络
        </Alert>
      </Snackbar>
    </>
  )
}

export default UserPage