import React from "react"
import { useEffect } from "react"
import { Box, Paper, TextField, Avatar, Button, Collapse, Typography, Link, CircularProgress } from "@mui/material"
import webSocket from 'socket.io-client'

const LoginPage = (hooks) => {
  const [avatar, setAvatar] = React.useState('')
  const [ws, setWs] = React.useState(null)
  const [requestSent, setReqStat] = React.useState(false)
  const [askRegister, setRegReady] = React.useState(false)
  const [inReg, setRegStat] = React.useState(false)
  const [inEmailCheck, setInEmailCheck] = React.useState(false)
  const [lastStep, setLastStep] = React.useState(false)
  const [user, setUser] = React.useState('')

  const connectWs = () => {
    if (process.env.NODE_ENV === 'development')
      setWs(webSocket('https://check.ixnet.icu/', { transports: ['websocket', 'polling'] }))
    else
      setWs(webSocket('/', { transports: ['websocket', 'polling'] }))
  }

  const initWebSocket = () => {
    ws.on('matched', (msg) => {
      if (msg !== 'nomatch') {
        if (!inReg) {
          setRegReady(false)
        }
        setAvatar('https://ixnet.icu/avatar/' + msg.toLowerCase())
      }
      else {
        var name = document.getElementById('user').value
        if (name.trim().length > 3) {
          setRegReady(true)
        }
        else {
          setRegReady(false)
        }
        setAvatar('')
      }
    })

    ws.on('invite code stat', (msg) => {
      if (msg === 'valid') {
        setInEmailCheck(true)
        ws.emit('listen email', document.getElementById('user').value)
        ws.on('email', (msg) => {
          setInEmailCheck(false)
          setLastStep(true)
          document.getElementById('email').value = msg
          // console.log(msg)
        })
      }
      else {
        alert('invalid invite code!')
      }
    })
  }

  const getUserAvatar = () => {
    var name = document.getElementById('user').value
    if (name.trim() !== '') {
      ws.emit('getUser', name)
    }
    else {
      setRegReady(false)
      setAvatar('')
    }
  }

  const handleLogin = () => {
    fetch('api/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: document.getElementById('user').value,
        pwd: document.getElementById('pwd').value
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          hooks.setLogin(true)
        }
        else {
          alert('wrong password')
        }
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  const handleRegister = () => {
    var name = document.getElementById('user').value
    var pwd = document.getElementById('pwdReg').value
    var email = document.getElementById('email').value
    var inviteCode = document.getElementById('inviteCode').value
    var realName = document.getElementById('realName').value
    fetch('api/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        pwd: pwd,
        email: email,
        inviteCode: inviteCode,
        realName: realName
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          document.getElementById('user').value = name
          document.getElementById('pwd').value = pwd
          handleLogin()
        }
        else {
          alert('failed')
        }
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  useEffect(() => {
    if (ws) {
      initWebSocket()
    }
  }, [ws])

  if (!requestSent) {
    setReqStat(true)
    connectWs()
  }

  return (
    <>
      <Paper
        sx={{
          width: "380px",
          margin: "auto",
          textAlign: "center",
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Box
          sx={{
            padding: '20px 20px 10px 20px'
          }}
        >
          <Avatar
            src={avatar}
            sx={{
              width: 64,
              height: 64,
              margin: 'auto',
              left: '0',
              right: '0'
            }}
          />
        </Box>
        <Box
          sx={{
            padding: '10px 40px 10px 40px'
          }}
        >
          <TextField
            fullWidth
            id='user'
            label='?????????'
            disabled={inReg}
            onChange={getUserAvatar}
          />
        </Box>
        <Collapse
          in={avatar !== '' && !inReg}
        >
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              fullWidth
              id='pwd'
              type='password'
              label='??????'
            />
          </Box>
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <Button
              onClick={handleLogin}
              variant='outlined'
            >
              ??????
            </Button>
          </Box>
        </Collapse>
        <Collapse
          in={inReg && !inEmailCheck && !lastStep}
        >
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              fullWidth
              id='realName'
              label='??????'
            />
          </Box>
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              fullWidth
              id='pwdReg'
              type='password'
              label='??????'
            />
          </Box>
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              fullWidth
              id='pwdRepeat'
              type='password'
              label='????????????'
            />
          </Box>
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              fullWidth
              id='inviteCode'
              label='?????????'
            />
          </Box>
        </Collapse>
        <Collapse
          in={lastStep}
        >
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <TextField
              id='email'
              disabled
              fullWidth
            />
          </Box>
        </Collapse>
        <Collapse
          in={(askRegister && avatar === '' && !inEmailCheck) || lastStep}
        >
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <Button
              onClick={() => {
                if (lastStep) {
                  handleRegister()
                }
                else if (inReg) {
                  setUser(document.getElementById('user').value)
                  let pwd = document.getElementById('pwdReg').value
                  let pwdRepeat = document.getElementById('pwdRepeat').value
                  let inviteCode = document.getElementById('inviteCode').value
                  if (pwd !== pwdRepeat) {
                    alert('password doesn\'t match')
                  }
                  else {
                    ws.emit('check invite code', inviteCode)
                  }
                }
                else {
                  setRegStat(true)
                }
              }}
              variant='outlined'
            >
              {inReg ? (lastStep ? '??????' : '?????????') : '??????'}
            </Button>
          </Box>
        </Collapse>
        <Collapse
          in={inEmailCheck}
        >
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <Typography>
              ??????????????????????????????????????????
            </Typography>
            <Typography
              sx={{
                padding: '10px 10px 10px 10px'
              }}
            >
              <Link
                href={'mailto:' + user + '@temp.ixnet.icu'}
                target='_blank'
              >
                {user + '@temp.ixnet.icu'}
              </Link>
            </Typography>
            <Typography>
              ????????????????????????????????????
            </Typography>
          </Box>
          <Box
            sx={{
              padding: '10px 40px 10px 40px'
            }}
          >
            <CircularProgress />
          </Box>
        </Collapse>
        <Box
          sx={{
            padding: '10px 20px 0 10px'
          }}
        />
      </Paper>
    </>
  )
}

export default LoginPage
