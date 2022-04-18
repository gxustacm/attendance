import express from 'express'
import cookies from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql'
import crypto from 'crypto'
import bodyParser from 'body-parser'
import compression from 'compression'

const app = express()
app.use(compression())
app.use(cookies())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }))
dotenv.config()

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
  }
})

const base62 = (id) => {
  var arr = '0123456789qwertyuiopasdfghjklzxcvbnmMNBVCXZLKJHGFDSAPOIUYTREWQ'
  var res = ''
  while (id > 0)
  {
      res = arr.substring(id % 62, id % 62 + 1) + res
      id = Math.floor(id / 62)
  }
  return res
}

const verifyTracker = (Tracker) => {
  var promise = new Promise((resolve, reject) => {
    connection.query('select `name`, `email` form `users` where `uid` = (select `uid` from `trackers` where id = ? and token = ?)', queryParams, (err, rows) => {
      if (rows[0] === undefined) {
        resolve({
          ok: false
        })
      }
      else {
        resolve({
          ok: true,
          name: rows[0].name,
          email: rows[0].email
        })
      }
    })
  })

  return promise
}

const genTracker = (uid) => {
  var promise = new Promise((resolove, reject) => {
    const deleteParams = [uid]
    connection.query('delete from `trackers` where `uid` = ?', deleteParams, (err) => {
      if (err) {
        reject(undefined)
        throw err
      }
      var Tracker = {
        id: 'T-' + base62(parseInt(now.getTime() / 1000 + now.getTime() % 1000)),
        token: 'T-' + base62(parseInt(now.getTime() / 10 + now.getTime() % 1000))
      }
      insertParams = [uid, Tracker.id, Tracker.token]
      connection.query('insert into `trackers` (`uid`, `id`, `token`) values (?, ?, ?)', insertParams, (err) => {
        if (err) {
          reject(undefined)
          throw err
        }
        resolve(Tracker)
      })
    })
  })
}

app.post('/api/login', (req, res) => {
  const md5 = crypto.createHash('md5')
  var pwd =  md5.update(req.body.pwd).digest('hex').toUpperCase()
  const queryParams = [req.body.name, pwd]
  connection.query('select count(*) from `users` where `name` = ? and pwd = ?')
})

app.get('/api/user', async (req, res) => {
  if (req.cookies['TrackerID'] !== undefined &&
    req.cookies['TrackerToken'] !== undefined) {
    var Tracker = {
      id: req.cookies['TrackerID'],
      token: req.cookies['TrackerToken']
    }
    var response = await verifyTracker(Tracker)
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

app.listen(1333, () => {
  console.log('[Info] Server started')
})