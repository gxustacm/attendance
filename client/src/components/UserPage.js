import React from 'react'
import { useEffect } from 'react'
import { Box, BottomNavigation, BottomNavigationAction, Snackbar, Alert, Typography, Button } from '@mui/material'
import { Attribution, Restore } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import webSocket from 'socket.io-client'
import cookie from 'react-cookies'
import UserInfoPage from './UserInfoPage'

const UserPage = (props) => {
  const [ws, setWs] = React.useState(null)
  const [requestSent, setReqStat] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [showMsg, setMsg] = React.useState(false)
  const [duplicated, setDuplicated] = React.useState(false)
  const [disconnectMsg, setDisconnectMsg] = React.useState(false)
  const [disconnected, setDisconnected] = React.useState(false)
  const [dura, setDura] = React.useState(0)
  const [onlineData, setOnlineData] = React.useState([])
  const [user, setUser] = React.useState({
    avatar: '',
    uid: '',
    uname: ''
  })

  const timer = React.useRef(null)

  const connectWs = () => {
    if (process.env.NODE_ENV === 'development')
      setWs(webSocket('https://check.ixnet.icu/', { transports: ['websocket', 'polling'] }))
    else
      setWs(webSocket('/', { transports: ['websocket', 'polling'] }))
  }

  const date = new Date()
  //const weekStart = parseInt(date.getTime() / (24 * 60 * 60 * 1000) - date.getDay()) * 24 * 60 * 60 * 1000

  const initWebSocket = () => {
    ws.on('stat', msg => {
      if (msg === 'success') {
        setMsg(true)
        setDisconnected(false)
        const timeStart = Date.parse(new Date())
        ws.emit('queryOnlineData', { year: date.getFullYear() })
        let intervalId = setInterval(() => {
          setDura(parseInt((Date.parse(new Date()) - timeStart) / 1000))
        }, 1000)
        timer.current = { id: intervalId }
      }

      if (msg === 'duplicated') {
        setMsg(true)
        setDuplicated(true)
        ws.disconnect()
        setWs(null)
      }
    })

    ws.on('onlineData', msg => {
      setOnlineData(msg)
      props.setLoading(false)
    })

    ws.on('userInfo', msg => {
      setUser(msg)
    })

    ws.on('disconnect', () => {
      clearInterval(timer.current.id)
      setDisconnectMsg(true)
      if (Notification.permission === "granted") {
        new Notification("连接已断开...")
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("已接受消息通知")
          }
        })
      }
      setDisconnected(true)
      ws.disconnect()
      setWs(null)
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
    setDisconnectMsg(false)
    setDuplicated(false)
    setDura(0)
    connectWs()
    // window.location.reload()
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
      <AnimatePresence
        mode='wait'
      >
        {
          page === 0 && (
            <motion.div
              key='page-0'
              initial={{
                opacity: 0,
                y: '3vh'
              }}
              animate={{
                opacity: 1,
                y: '0'
              }}
              exit={{
                opacity: 0,
                y: '-3vh'
              }}
            >
              <UserInfoPage
                onlineData={onlineData}
                user={user}
                disconnected={disconnected}
                handleReconnect={handleReconnect}
              />
            </motion.div>
          )
        }
        {
          page === 1 && (
            <motion.div
              key='page-1'
              initial={{
                opacity: 0,
                y: '3vh'
              }}
              animate={{
                opacity: 1,
                y: '0'
              }}
              exit={{
                opacity: 0,
                y: '-3vh'
              }}
            >
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
            </motion.div>
          )
        }
      </AnimatePresence>
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
          }}
        >
          <BottomNavigationAction
            label='我的'
            icon={<Attribution />}
          />
          <BottomNavigationAction
            label='计时器'
            icon={<Restore />}
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