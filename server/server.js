import express from 'express'
import cookies from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2'
import crypto from 'crypto'
import bodyParser from 'body-parser'
import compression from 'compression'
import { Server } from 'socket.io'
import http from 'http'
import mailin from 'mailin'

dotenv.config()
const app = express()
app.use(compression())
app.use(cookies())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: 'true' }))
app.use(bodyParser.json({ extended: 'true' }))
const server = http.createServer(app)
const io = new Server(server, { cors: true })

let userList = {}

let onRegister = new Map()
let clients = new Map()

const encrypt = (str) => {
  const md5 = crypto.createHash('md5')
  return md5.update(str).digest('hex').toUpperCase()
}

const base62 = (id) => {
  let arr = '0123456789qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ'
  let res = ''
  while (id > 0) {
    res = arr.substring(id % 62, id % 62 + 1) + res
    id = Math.floor(id / 62)
  }
  return res
}

const verifyTracker = (Tracker) => {
  let promise = new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) throw err
      const queryParams = [Tracker.id, Tracker.token]
      connection.query('select count(*), `uid` from `trackers` where id = ? and token = ?', queryParams, (err, rows) => {
        if (rows[0]['count(*)'] === 0) {
          resolve({
            ok: false
          })
        }
        else {
          resolve({
            ok: true,
            uid: rows[0].uid
          })
        }
      })
      connection.release()
    })
  })

  return promise
}

const genTracker = (uid) => {
  let promise = new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) throw err
      const deleteParams = [uid]
      connection.query('delete from `trackers` where `uid` = ?', deleteParams, (err) => {
        if (err) {
          reject(undefined)
          throw err
        }
        let now = new Date()
        let Tracker = {
          id: 'T-' + base62(parseInt(now.getTime() / 1000 + now.getTime() % 1000)),
          token: 'T-' + base62(parseInt(now.getTime() / 10 + now.getTime() % 1000))
        }
        let insertParams = [uid, Tracker.id, Tracker.token]
        connection.query('insert into `trackers` (`uid`, `id`, `token`) values (?, ?, ?)', insertParams, (err) => {
          if (err) {
            reject(undefined)
            throw err
          }
          resolve(Tracker)
        })
      })
      connection.release()
    })
  })

  return promise
}

io.on('connection', (socket) => {
  let uid = null
  let startTime = null

  socket.on('getUser', (msg) => {
    if (msg in userList) {
      socket.emit('matched', encrypt(userList[msg]))
    } else {
      socket.emit('matched', 'nomatch')
    }
  })

  socket.on('check invite code', (msg) => {
    connectionPool.getConnection((err, connection) => {
      if (err) throw err
      const queryParams = [msg]
      connection.query('select count(*) from `codes` where `code` = ?', queryParams, (err, rows) => {
        if (err) {
          socket.emit('invite code stat', 'invalid')
          throw err
        }
        if (rows[0]['count(*)']) {
          socket.emit('invite code stat', 'valid')
        }
        else {
          socket.emit('invite code stat', 'invalid')
        }
      })
      connection.release()
    })
  })

  socket.on('listen email', (user) => {
    console.log('listening: ' + user)
    onRegister.delete(user)
    onRegister.set(user, socket)
  })

  socket.on('sign in', async (msg) => {
    let stat = await verifyTracker(JSON.parse(msg))
    if (stat.ok) {
      if (clients.has(stat.uid)) {
        socket.emit('stat', 'duplicated')
      }
      else {
        uid = stat.uid
        startTime = new Date()
        // startTime = now.getTime()
        clients.set(stat.uid, socket)
        connectionPool.getConnection((err, connection) => {
          if (err) throw err
          connection.query('select `name`, `email` from `users` where `uid` = ?', [uid], (err, rows) => {
            if (err) throw err
            socket.emit('stat', 'success')
            socket.emit('userInfo', {
              uid: uid,
              uname: rows[0].name,
              avatar: encrypt(rows[0].email)
            })
          })
        })
        console.log('[Info] user with uid: ' + uid + ' has connected')
      }
    }
    else {
      socket.emit('stat', 'failed')
    }
  })

  socket.on('queryOnlineData', async (msg) => {
    connectionPool.getConnection((err, connection) => {
      if (err) throw err
      if (uid !== null) {
        let year = msg.year
        let queryParams = [uid, new Date(`${year}-01-01`), new Date(`${year + 1}-01-01`)]
        connection.query('select * from `statistics` where `uid` = ? and `start` >= ? and `start` < ?', queryParams, (err, rows) => {
          let tmp = {}
          const format = (s) => {
            if (s < 10) {
              return '0' + s
            }
            return s
          }
          for (let key in rows) {
            let date = new Date(rows[key].start)
            let parsedDate = `${date.getFullYear()}-${format(date.getMonth())}-${format(date.getDate())}`
            if (parsedDate in tmp) {
              tmp[parsedDate] += ((new Date(rows[key].end)) - date.getTime()) / 1000 / 60 / 60
            } else {
              tmp[parsedDate] = ((new Date(rows[key].end)) - date.getTime()) / 1000 / 60 / 60
            }
          }
          socket.emit('onlineData', tmp)
        })
      } else {
        socket.emit('onlineData', 'access denined')
      }
      connection.release()
    })
  })

  socket.on('disconnect', () => {
    connectionPool.getConnection((err, connection) => {
      if (err) throw err
      if (uid !== null) {
        let now = new Date()
        const insertParams = [uid, startTime, now]
        if (now - startTime >= 60 * 1000) {
          connection.query('insert into `statistics` (`uid`, `start`, `end`) values (?, ?, ?)', insertParams, (err) => {
            if (err) {
              throw err
            }
          })
        }
        console.log('[Info] user with uid: ' + uid + ' has been disconnected')
        clients.delete(uid)
      }
      connection.release()
    })
  })
})

mailin.start({
  host: "0.0.0.0",
  port: 25,
  disableWebhook: true
})

mailin.on('message', (conn, data) => {
  let to = data.headers.to
  let exp = /[\w\._\-\+]+@[\w\._\-\+]+/i
  if (exp.test(to)) {
    let matches = to.match(exp)
    let shortid = matches[0].substring(0, matches[0].indexOf('@'))
    if (onRegister.has(shortid)) {
      console.log('catched: ' + shortid)
      onRegister.get(shortid).emit('email', data.headers.from.match(exp)[0])
      onRegister.get(shortid).emit('matched', encrypt(data.headers.from.match(exp)[0]))
    }
  }
})

const connectionPool = mysql.createPool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  database: process.env.SQL_NAME
})

/*
const connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PWD,
  database: process.env.SQL_NAME
})

connection.connect((err) => {
  if (err) {
    console.log('\x1B[31m[Erro] \x1B[0m%s', err.code)
    console.log('[Info] Program will be exit, please check the DB configuration')
    process.exit(0)
  }

  else {
    console.log('[Info] DB Connection Established')
    setUserList()
  }
})
*/

const setUserList = () => {
  connectionPool.getConnection((err, connection) => {
    if (err) throw err
    connection.query('select `name`, `email` from `users`', (err, rows) => {
      for (let key in rows) {
        userList[rows[key].name] = rows[key].email
      }
    })
    connection.release()
  })
}

app.get('/api/userinfo/:id', (req, res) => {
  if (req.params.id === 'queryAll') {
    let keys = clients.keys()
    res.json({
      online: [...keys]
    })
  } else {
    res.json({
      uid: req.params.id,
      isOnline: clients.has(parseInt(req.params.id))
    })
  }
})

app.post('/api/login', (req, res) => {
  connectionPool.getConnection((err, connection) => {
    if (err) throw err
    let pwd = encrypt(req.body.pwd)
    const queryParams = [req.body.name, pwd]
    connection.query('select count(*), `uid` from `users` where `name` = ? and pwd = ?', queryParams, async (err, rows) => {
      if (err) {
        res.json({ ok: false })
        throw err
      }
      if (rows[0]['count(*)']) {
        try {
          let Tracker = await genTracker(rows[0].uid)
          res.cookie('tracker-id', Tracker.id)
          res.cookie('tracker-token', Tracker.token)
          res.json({
            ok: true,
            uid: rows[0].uid
          })
        }
        catch (err) {
          res.json({
            ok: false
          })
        }
      }
      else {
        res.json({ ok: false })
      }
    })
    connection.release()
  })
})

app.post('/api/register', (req, res) => {
  connectionPool.getConnection((err, connection) => {
    if (err) throw err
    let name = req.body.name
    let pwd = req.body.pwd
    let email = req.body.email
    let inviteCode = req.body.inviteCode
    let realName = req.body.realName
    let queryParams = [inviteCode]
    connection.query('select `role` from `codes` where `code` = ?', queryParams, (err, rows) => {
      if (err) {
        res.json({
          ok: false
        })
        throw err
      }
      queryParams = [name]
      let role = rows[0].role
      connection.query('select count(*) from `users` where `name` = ?', queryParams, (err, rows) => {
        if (err) {
          res.json({
            ok: false
          })
          throw err
        }
        if (!rows[0]['count(*)']) {
          queryParams = [name, encrypt(pwd), email, role, realName]
          connection.query('insert into `users` (`name`, `pwd`, `email`, `role`, `realname`) values (?, ?, ?, ?, ?)', queryParams, (err) => {
            if (err) {
              res.json({
                ok: false
              })
              throw err
            }
            setUserList()
            res.json({
              ok: true
            })
          })
        }
        else {
          res.json({
            ok: true
          })
        }
      })
    })
    connection.release()
  })
})

app.get('/api/user', async (req, res) => {
  if (req.cookies['tracker-id'] !== undefined &&
    req.cookies['tracker-token'] !== undefined) {
    let Tracker = {
      id: req.cookies['tracker-id'],
      token: req.cookies['tracker-token']
    }
    let response = await verifyTracker(Tracker)
    if (response.ok) {
      res.json({
        ok: true,
        name: response.name,
        email: response.email
      })
    }
    else {
      res.json({
        ok: false
      })
    }
  }
  else {
    res.json({
      ok: false
    })
  }
})

server.listen(1334, () => {
  console.log('[Info] Server started')
  setUserList()
})