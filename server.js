const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const mysql = require('mysql')
const bodyParser = require('body-parser')
const ent = require('ent')
const crypto = require('crypto')
const fs = require('fs')
const nodemailer = require('nodemailer')
const uniqid = require('uniqid')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const sha1 = require('sha1')
const path = require('path')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(fileUpload())
app.use('/public', express.static(path.join(__dirname, '/public')))

app.use(cors())
app.use(fileUpload())
app.use(bodyParser.json({ limit: '10Mb' }))
  .use(bodyParser.urlencoded({ extended: false }))

let server = app.listen(port, () => { console.log('Listening on port ' + port) })
let io = require('socket.io')(server, {pingTimeout: 5000, pingInterval: 10000, transports: ['polling']})

let con = mysql.createConnection({
  host: 'localhost',
  user: 'matcha',
  password: 'root42',
  multipleStatements: true
})

let SendNotifGen = null

io.on('connection', (socket) => {
  // console.log(socket.id)
  socket.on('joinRoom', (data) => {
    socket.join(data)
  })
  socket.on('SEND_MESSAGE', data => {
    let uname = ent.encode(data.author)
    let message = ent.encode(data.message)
    let uid = data.id
    let room = ent.encode(data.room)
    console.log(data.room)
    let date = new Date()
    con.query('SELECT `match` FROM `like` WHERE uid = ? AND token_room = ?', [uid, room], (err, ures) => {
      if (err) throw err
      else {
        let match = ures[0].match
        let sql = 'INSERT INTO `message` (uid, `match`, text, creation_date, chat_id) VALUES (?,?,?,?,?); INSERT INTO `notif` (`uid`, `uid_receiver`, `type`, `seen`) VALUES (?, ?, 5, 0)'
        con.query(sql, [uid, match, message, date, room, uid, match], (err, res) => {
          if (err) throw err
          else {
            sendNotif(match, 'You have a new message !')
            io.to(room).emit('RECEIVE_MESSAGE', data)
          }
        })
      }
    })
  })
  socket.on('getAll/Conv', data => {
    let id = data.id
    con.query('SELECT * FROM `like` WHERE uid = ? AND status = 2', [id], (err, result) => {
      if (err) throw err
      else {
        for (let i = 0; i < result.length; i++) {
          con.query('SELECT uname FROM users WHERE id = ?', [result[i].match], (err, ures) => {
            if (err) throw err
            else {
              result[i]['uname'] = ures[0].uname
              if (i === result.length - 1) io.emit('receive/conv/' + id, result)
            }
          })
        }
      }
    })
  })
  socket.on('visit', data => {
    console.log(data)
    let idvisitor = data.visitor
    let idvisited = data.visited
    con.query('SELECT * FROM `notif` WHERE uid = ? AND uid_receiver = ? AND type = 1', [idvisitor, idvisited], (err, res) => {
      if (err) throw err
      if (res.length === 0) {
        con.query('INSERT INTO `notif` (uid, uid_receiver, type, seen) VALUES (?, ?, 1, 0)', [idvisitor, idvisited], (err, result) => {
          if (err) throw err
          else {
            sendNotif(idvisited, 'You have a new visit !')
          }
        })
      }
    })
  })
  // socket.on('notif', data => {
  //   let uid = ent.encode(data.uid)
  //   con.query('SELECT * FROM `notif` WHERE `uid_receiver` = ? AND `seen` = 0', [uid], (err, result) => {
  //     if (err) throw err
  //     if (result.length !== 0) {
  //       console.log(result)
  //       io.emit('/sendnotif' + uid, result)
  //     }
  //   })
  // })

  let sendNotif = (id, mess) => {
    io.emit('sendnotif/' + id, mess)
  }
  SendNotifGen = sendNotif
})

let db = fs.readFileSync('./config/Matcha.sql', 'UTF-8')
con.connect(function (err) {
  if (err) throw err
  con.query(db, (err, resp) => {
    if (err) throw err
  })
})

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .get('/reset_password/:token/:uname', (req, res) => {
    if (!req.params.token || !req.params.uname) {
      console.log('ERROR')
    } else {
      let sql = 'SELECT * from users WHERE uname = ? AND token = ?'
      con.query(sql, [req.params.uname, req.params.token], (err, res) => {
        if (err) throw err
        if (res[0].token === req.params.token && res[0].uname === req.params.uname) {
          console.log('GOOD')
        }
      })
      res.end()
    }
  })

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .get('/profil/:id', (req, res) => {
    if (!req.params.id) {
      console.log('ERROR')
    } else {
      let sql = 'SELECT * from users WHERE id = ?'
      con.query(sql, [req.params.id], (err, resu) => {
        if (err) throw err
        if (resu.length > 0) {
        res.send(resu)
        res.end()
        } else {
          res.send(false)
          res.end()
        }
      })
    }
  })

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/validation/:token/:uname', (req, res) => {
    if (!req.params.token || !req.params.uname)
      console.log('ERROR')
    else {
      let sql = 'SELECT * from users WHERE uname = ? AND token = ?'
      con.query(sql, [req.params.uname, req.params.token], (err, res) => {
        if (err) throw err
        if (res[0].token === req.params.token && res[0].uname === req.params.uname) {
          let sql1 = 'UPDATE users SET confirmation = 1 WHERE uname = ?'
          con.query(sql1, [req.params.uname], (err, resul) => {
            if (err) throw err
          })
        }
      })
      res.end()
    }
  })

app.post('/getAllMess', (req, res) => {
  con.query('SELECT * FROM message WHERE uid = ? OR `match` = ?', [req.body.id, req.body.id], (err, result) => {
    if (err) throw err
    let all = {}
    for (let i = 0; i < result.length; i++) {
      con.query('SELECT uname FROM users WHERE id = ?', [result[i].uid], (err, nameRes) => {
        if (err) throw err
        else {
          if (!all[result[i].chat_id])
            all[result[i].chat_id] = {}
            all[result[i].chat_id][result[i].id] = {author: nameRes[0].uname, message: result[i].text, id: result[i].uid, room: result[i].chat_id }
            if (i === result.length - 1) {
              res.send(all)
              res.end()
            }
        }
      })
    }
    // res.send(result)
    // res.end()
  })
})

app.post('/register', (req, res) => {
  let uname = ent.encode(req.body.uname)
  let lname = ent.encode(req.body.lname)
  let fname = ent.encode(req.body.fname)
  let mail = ent.encode(req.body.mail)
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  let token = sha1(uniqid())
  let gender = req.body.gender
  let sexual = req.body.sexual_orientation
  con.query('SELECT * FROM users WHERE uname = ? OR email = ?', [uname, mail], (err, resu) => {
    if (err) throw err
    if (resu.length === 0) {
      con.query('INSERT INTO users(uname, lname, fname, email, password, token, gender, sexual_orientation) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [uname, lname, fname, mail, pwd, token, gender, sexual], (err, resul) => {
        if (err) throw err
      })
      con.query('SELECT * FROM users WHERE uname = ? and token = ?', [uname, token], (err, result) => {
        if (err) throw err
        if (uname === result[0].uname && token === result[0].token) {
          console.log('yo')
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'willfln34@gmail.com',
              pass: 'matcha1234'
            }
          })
          let mail = {
            from: 'Matcha@gmail.com',
            to: result[0].email,
            subject: 'Account validation',
            html: '<p>Welcome to Matcha ' + result[0].uname + '</p><br><p>To validate your account please click on the link below:</p><br><a href="http://localhost:3000/validation/' + result[0].token + '/' + result[0].uname + '">Validate your account</a>'
          }
          transporter.sendMail(mail, function (error, info) {
            if (error) throw error
            // res.send('GOOD')
            // res.end()
          })
          transporter.close()
          res.send('GOOD')
          res.end()
        } else {
          con.query('DELETE * FROM users WHERE uname = ?', [uname], (err, results) => {
            if (err) throw err
            res.end()
          })
        }
      })
    } else {
      res.send('ERRORL')
      res.end()
    }
  })
})

app.post('/connexion', (req, res) => {
  let login = ent.encode(req.body.login)
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  let sql = 'SELECT * FROM users WHERE uname = ? AND password = ? AND confirmation = 1'
  con.query(sql, [login, pwd], (err, res2) => {
    if (err) throw err
    if (res2.length === 1) {
      res.send(res2)
    }
    res.end()
  })
})

app.post('/profil/getdata', (req, res) => {
  // if (!req.body) {}
  con.query('SELECT * FROM users WHERE id = ?', [req.body.id], (err, resu) => {
    if (err) throw err
    res.send(resu)
    res.end()
  })
})

app.post('/changepassword', (req, res) => {
  console.log('yo')
  let id = req.body.id
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  let newpwd = crypto.createHash('whirlpool').update(req.body.newpwd).digest('hex')
  let cnewpwd = crypto.createHash('whirlpool').update(req.body.cnewpwd).digest('hex')
  con.query('SELECT * FROM users WHERE id = ?', [id], (err, resu) => {
    if (err) throw err
    if (pwd === resu[0].password && newpwd === cnewpwd) {
      con.query('UPDATE users SET password = ? WHERE id = ?', [newpwd, id], (err, resul) => {
        if (err) throw err
        res.send('GOOD')
        res.end()
      })
    } else {
      res.send('ERROR')
      res.end()
    }
  })
})

app.post('/settings', (req, res) => {
  let id = req.body.id
  let lname = ent.encode(req.body.lname)
  let fname = ent.encode(req.body.fname)
  let age = ent.encode(req.body.age)
  let gender = ent.encode(req.body.gender)
  let sexe = ent.encode(req.body.sexual_orientation)
  let sql = 'UPDATE users SET lname = ?, fname = ?, age = ?, gender = ?, sexual_orientation = ?, bio = ? WHERE id = ?'
  con.query(sql, [lname, fname, age, gender, sexe, req.body.bio, id], (err, resu) => {
    if (err) throw err
    res.send('GOOD')
    res.end()
  })
})

app.post('/changemail', (req, res) => {
  let mail = ent.encode(req.body.newemail)
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  let uname = ent.encode(req.body.uname)
  let sql = 'SELECT * FROM users WHERE uname = ? AND password = ?'
  con.query(sql, [uname, pwd], (err, resu) => {
    if (err) throw err
    let id = resu[0].id
    let sql = 'UPDATE users SET email = ? WHERE id = ?'
    con.query(sql, [mail, id], (err, resul) => {
      if (err) throw err
      res.end()
    })
  })
})

app.post('/deleteaccount', (req, res) => {
  let uname = ent.encode(req.body.uname)
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  con.query('SELECT * FROM users WHERE uname = ? AND password = ?', [uname, pwd], (err, resul) => {
    if (err) throw err
    if (resul.length > 0) {
      let sql = 'DELETE FROM users WHERE uname = ? AND password = ?'
      con.query(sql, [uname, pwd], (err, resu) => {
        if (err) throw err
        res.send('GOOD')
        res.end()
      })
    } else {
      res.send('ERROR')
      res.end()
    }
  })
})

app.post('/forgot', (req, res) => {
  let login = ent.encode(req.body.login)
  let email = ent.encode(req.body.email)
  let sql = 'SELECT * FROM users WHERE uname = ? AND email = ?'
  con.query(sql, [login, email], (err, res) => {
    if (err) throw err
    if (login === res[0].uname && email === res[0].email) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'willfln34@gmail.com',
          pass: 'matcha1234'
        }
      })
      let mail = {
        from: 'Matcha@gmail.com',
        to: res[0].email,
        subject: 'Reset your password',
        html: '<p>Hello ' + res[0].uname + '</p><br><p>To change your password please click on the link below:</p><br><a href="http://localhost:3000/reset_password/' + res[0].token + '/' + res[0].uname +'">Change password</a>'
      }
      transporter.sendMail(mail, function (error, info) {
        if (error) throw error
        if (error) {
          console.log('Email has not been sent')
        } else {
          console.log('Email sent')
        }
      })
      transporter.close()
    }
  })
  res.end()
})

app.post('/reset', (req, res) => {
  let login = ent.encode(req.body.login)
  let pwd = crypto.createHash('whirlpool').update(req.body.pwd).digest('hex')
  let cpwd = crypto.createHash('whirlpool').update(req.body.cpwd).digest('hex')
  let sql = 'SELECT * FROM users WHERE uname = ?'
  con.query(sql, [login], (err, res) => {
    if (err) throw err
    if (login === res[0].uname) {
      let sql1 = 'UPDATE users SET password = ? WHERE uname = ?'
      con.query(sql1, [cpwd, login], (err, res) => {
        if (err) throw err
      })
    }
  })
  res.end()
})

app.post('/feed/display', (req, res) => {
  let id = req.body.id
  let sql = 'SELECT * from users WHERE id = ?'
  con.query(sql, [id], (err, result) => {
    if (err) throw err
    if (result[0].age && result[0].image) {
      let sexual = result[0].sexual_orientation
      let gender = result[0].gender
      let age = result[0].age
      let x = 5
      let y = 5
      let agemin = age - (x)
      let agemax = (age - (y) + (x) + (x))
      let sql = 'SELECT * from users WHERE sexual_orientation = ? AND gender != ? AND age BETWEEN ? AND ? AND id NOT IN (SELECT `match` FROM `like` WHERE uid = ?) AND `image` != ""'
      filters(sexual, gender, agemin, agemax, sql, req.body.filter, req.body.id, result[0].lat, result[0].ln)
    } else {
      res.send('error')
      res.end()
    }
  })
  function filters (sexual, gender, agemin, agemax, sql, filter, id, lat, ln) {
    if (filter === 'AgeA') {
      con.query(sql + ' ORDER BY age ASC', [sexual, gender, agemin, agemax, id], (err, resu) => {
        if (err) throw err
        distance(resu, lat, ln)
      })
    } else if (filter === 'AgeD') {
      con.query(sql + ' ORDER BY age DESC', [sexual, gender, agemin, agemax, id], (err, resu) => {
        if (err) throw err
        distance(resu, lat, ln)
      })
    } else if (filter === 'ScoreA') {
      con.query(sql + ' ORDER BY score ASC', [sexual, gender, agemin, agemax, id], (err, resu) => {
        if (err) throw err
        distance(resu, lat, ln)
      })
    } else if (filter === 'ScoreD') {
      con.query(sql + ' ORDER BY score DESC', [sexual, gender, agemin, agemax, id], (err, resu) => {
        if (err) throw err
        distance(resu, lat, ln)
      })
    } else {
      con.query(sql, [sexual, gender, agemin, agemax, id], (err, resu) => {
        if (err) throw err
        distance(resu, lat, ln)
      })
    }
  }
  function distance (resu, lat, ln) {
    let tab = []
    for (let k in resu) {
      resu[k].distance = getDistanceFromLatLonInKm(resu[k].lat, resu[k].ln, lat, ln)
      console.log(resu.length)
      if (resu[k].distance <= 25) {
        tab.push(resu[k])
        if (parseInt(k, 10) === resu.length - 1) {
          res.send(tab)
          res.send()
        }
      } else {
        res.send(null)
        res.end()
      }
    }
  }
})

app.post('/profil/match', (req, res) => {
  let sql = 'SELECT * FROM `users` WHERE `id` IN ( SELECT `match` FROM `like` WHERE `uid` = ? AND status = 2)'
  con.query(sql, [req.body.id], (err, resul) => {
    if (err) throw err
    res.send(resul)
    res.end()
  })
})

app.post('/like', (req, res) => {
  let sql = 'SELECT * FROM `like` WHERE `uid` = ? AND `match` = ?'
  con.query(sql, [req.body.id, req.body.id_match], (err, resu) => {
    if (err) throw err
    if (resu[0]) {
    } else {
      let sql = 'SELECT * FROM `like` WHERE `match` = ? AND `uid` = ?'
      con.query(sql, [req.body.id, req.body.id_match], (err, resul) => {
        if (err) throw err
        if (resul[0]) {
          if (req.body.id.to === resul[0].match.to) {
            let token_room = sha1(uniqid())
            let sql = 'INSERT INTO `like`(`uid`, `match`, `status`, `token_room`) VALUES (?, ?, 2, ?); UPDATE `like` SET status = 2 WHERE `uid` = ? AND `match` = ?; UPDATE `like` SET token_room = ? WHERE `uid` = ? AND `match` = ?; INSERT INTO `notif` (`uid`, `uid_receiver`, `type`, `seen`) VALUES (?, ?, 3, 0)'
            con.query(sql, [req.body.id, req.body.id_match, token_room, req.body.id_match, req.body.id, token_room, req.body.id_match, req.body.id, req.body.id, req.body.id_match], (err, result) => {
              if (err) throw err
              else {
                SendNotifGen(req.body.id_match, 'You have a new match !')
                SendNotifGen(req.body.id, 'You have a new match !')
              }
            })
          }
        } else {
          let sql = 'INSERT INTO `like`(`uid`, `match`, `status`, `token_room`) VALUES (?, ?, 1, NULL); INSERT INTO `notif`(`uid`, `uid_receiver`, `type`, `seen`) VALUES (?, ?, 2, 0)'
          con.query(sql, [req.body.id, req.body.id_match, req.body.id, req.body.id_match], (err, result) => {
            if (err) throw err
            else {
              SendNotifGen(req.body.id_match, 'You have a new like !')
            }
          })
        }
      })
    }
  })
  res.end()
})

app.post('/profil/match/dislike', (req, res) => {
  let sql = 'SELECT * FROM `like` WHERE `uid` = ? AND `match` = ?'
  con.query(sql, [req.body.id, req.body.id_match], (err, resu) => {
    if (err) throw err
    if (resu[0]) {
      let sql1 = 'UPDATE `like` SET token_room = NULL WHERE `uid` = ? AND `match` = ?'
      con.query(sql1, [resu[0].uid, resu[0].match], (res, resul) => {
        if (err) throw err
      })
      let sql = 'UPDATE `like` SET status = -1 WHERE `uid` = ? AND `match` = ?'
      con.query(sql, [resu[0].uid, resu[0].match], (res, resul) => {
        if (err) throw err
      })
      let sql2 = 'UPDATE `like` SET status = -1, token_room = NULL WHERE uid = ? AND `match` = ?; INSERT INTO `notif`(`uid`, `uid_receiver`, `type`, `seen`) VALUES (?, ?, 4, 0)'
      con.query(sql2, [resu[0].match, resu[0].uid, resu[0].uid, resu[0].match], (err, results) => {
        if (err) throw err
      })
    } else {
      let sql = 'INSERT INTO `like`(`uid`, `match`, `status`, `token_room`) VALUES (?, ?, -1, NULL); INSERT INTO `notif`(`uid`, `uid_receiver`, `type`, `seen`) VALUES (?, ?, 4, 0)'
      con.query(sql, [req.body.id, req.body.id_match, req.body.id, req.body.id_match], (err, result) => {
        if (err) throw err
      })
    }
  })
  res.end()
})

app.post('/profil/image/upload', (req, res) => {
  con.query('SELECT `post_url` FROM `image` WHERE uid = ?', [req.body.id], (err, resul) => {
    if (err) throw err
    if (resul.length === 5) {
      res.end()
    } else {
      let name = uniqid() + '.png'
      let data = req.body.dataURL
      data = data.split(',')
      let ext = data[0].indexOf('image')
      if (ext !== -1) {
        let img = data[1]
        fs.writeFileSync('./images/users/' + name, img, 'base64', (err) => {
          if (err) throw err
        })
        let sql = 'INSERT INTO `image`(`uid`, `post_url`) VALUES (?, ?)'
        con.query(sql, [req.body.id, name], (err, result) => {
          if (err) throw err
          let sql = 'SELECT `post_url` from `image` WHERE uid = ?'
          con.query(sql, [req.body.id], (err, resu) => {
            if (err) throw err
            res.send(resu)
            res.end()
          })
        })
      }
    }
  })
})

app.post('/profil/image/profilpic', (req, res) => {
  let name = uniqid() + '.png'
  let data = req.body.dataURL
  data = data.split(',')
  let ext = data[0].indexOf('image')
  if (ext !== -1) {
    let img = data[1]
    fs.writeFile('./images/users/' + name, img, 'base64', (err) => {
      if (err) throw err
    })
    let sql = 'UPDATE users SET image = ? WHERE id = ?'
    con.query(sql, [name, req.body.id], (err, result) => {
      if (err) throw err
      let sql = 'SELECT `image` from `users` WHERE id = ?'
      con.query(sql, [req.body.id], (err, resu) => {
        if (err) throw err
        res.send(resu)
        res.end()
      })
    })
  }
})

app.post('/profil/image/display/profilpic', (req, res) => {
  con.query('SELECT `image` FROM users WHERE id = ?', [req.body.id], (err, resu) => {
    if (err) throw err
    if (resu[0].image) {
      fs.readFile('./images/users/' + resu[0].image, 'base64', (err, contents) => {
        if (err) throw err
        let content = 'data:image/png;base64,' + contents
        res.send(content)
        res.end()
      })
    } else {
      res.end()
    }
  })
})

app.post('/profil/image/display', (req, res) => {
  console.log(req.body.id)
  let sql = 'SELECT * FROM `image` WHERE uid = ?'
  con.query(sql, [req.body.id], (err, resu) => {
    if (err) throw err
    console.log(resu)
    res.send(resu)
    res.end()
  })
})

app.post('/profil/imgage/delete', (req, res) => {
  let sql = 'SELECT * FROM `image` WHERE id = ?'
  con.query(sql, [req.body.id], (err, resul) => {
    if (err) throw err
    const fs = require('fs')
    fs.unlink('./images/users/' + resul[0].post_url, (err) => {
      if (err) throw err
    })
    let sql = 'DELETE FROM `image` WHERE id = ?'
    con.query(sql, [req.body.id], (err, resu) => {
      if (err) throw err
    })
  })
  res.end()
})

// app.post('/search/fetch', (req, res) => {
//   let distance = req.body.data.distance
//   let idme = req.body.id
//   let filter = req.body.filter
//   let reqAge = req.body.data.value
//   let reqScore = req.body.data.score
//   let reqGender = req.body.data.gender
//   let reqSexual = req.body.data.sexual
//   let data = req.body.data.tags
//   let tags = []
  
//   if (data.length > 0) {
//     let tag = null
//     for (let p in data) {
//       tags[p] = data[p].text
//       if (tag === null) {
//         tag = "interest LIKE '" + tags[p] + "'"
//       } else {
//         tag += " OR interest LIKE '" + tags[p] + "'"
//       }
//       if (p.toString() === (data.length - 1).toString()) {
//         let reqTag = 'SELECT uid FROM interest WHERE ' + tag
//         reqTags(reqTag, reqAge, reqScore, reqGender, reqSexual, filter, distance, idme)
//       }
//     }
//   } else {
//     if (data.length === 0 && reqGender.length > 0 && reqSexual.length > 0) {
//       reqWithoutTag(reqScore, reqAge, reqGender, reqSexual, filter, distance, idme)
//     } else if (reqGender.length === 0 && reqSexual.length > 0) {
//       reqWithoutGender(reqScore, reqAge, reqSexual, filter, distance, idme)
//     } else if (reqSexual.length === 0 & reqGender.length > 0) {
//       reqWithoutSexual(reqScore, reqAge, reqGender, filter, distance, idme)
//     } else if (reqSexual.length === 0 & reqGender.length === 0) {
//       reqWithoutSexualGender(reqScore, reqAge, filter, distance, idme)
//     }
//   }
//   function reqTags (reqTag, reqAge, reqScore, reqGender, reqSexual, filter, distance, idme) {
//     let id = []
//     con.query(reqTag, (err, resu) => {
//       if (err) throw err
//       if (resu[0]) {
//         let ids = null
//         for (let i in resu) {
//           id[i] = resu[i].uid
//           if (ids == null) {
//             ids = "id = '" + id[i] + "'"
//           } else {
//             ids += " OR id = '" + id[i] + "'"
//           }
//           if (parseInt(i, 10) === resu.length - 1) {
//             let idUsers = 'SELECT * FROM users WHERE (' + ids + ')'
//             reqAll(idUsers, reqAge, reqScore, reqGender, reqSexual, filter, distance, idme)
//           }
//         }
//       }
//     })
//   }
//   function reqAll (idUsers, reqAge, reqScore, reqGender, reqSexual, filter, distance, idme) {
//     if (reqGender.length === 0 && reqSexual.length > 0) {
//       let finalReq = idUsers + ' AND age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ' AND score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + " AND (sexual_orientation LIKE '" + reqSexual[0] + "' OR sexual_orientation LIKE '" + reqSexual[1] + "' OR sexual_orientation LIKE '" + reqSexual[2] + "') AND id NOT IN (SELECT `match` FROM `like` WHERE uid = " + req.body.id + ') AND id != ' + req.body.id + ' AND `image` != ""'
//       fuckingUltimateReq(finalReq, filter, distance, idme)
//     } else if (reqSexual.length === 0 && reqGender.length > 0) {
//       let finalReq = idUsers + ' AND age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ' AND score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + " AND (gender LIKE '" + reqGender[0] + "' OR gender LIKE '" + reqGender[1] + "') AND id NOT IN (SELECT `match` FROM `like` WHERE uid = " + req.body.id + ') AND id != ' + req.body.id + ' AND `image` != ""'
//       fuckingUltimateReq(finalReq, filter, distance, idme)
//     } else if (reqSexual.length === 0 && reqGender.length === 0) {
//       let finalReq = idUsers + ' AND age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ' AND score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + ' AND id NOT IN (SELECT `match` FROM `like` WHERE uid = ' + req.body.id + ') AND id != ' + req.body.id + ' AND `image` != ""'
//       fuckingUltimateReq(finalReq, filter, distance, idme)
//     } else {
//       let finalReq = idUsers + ' AND age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ' AND score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + " AND (gender LIKE '" + reqGender[0] + "' OR gender LIKE '" + reqGender[1] + "') AND (sexual_orientation LIKE '" + reqSexual[0] + "' OR sexual_orientation LIKE '" + reqSexual[1] + "' OR sexual_orientation LIKE '" + reqSexual[2] + "') AND id NOT IN (SELECT `match` FROM `like` WHERE uid = " + req.body.id + ') AND id != ' + req.body.id + ' AND `image` != ""'
//       fuckingUltimateReq(finalReq, filter, distance, idme)
//     }
//   }
//   function reqWithoutTag (reqScore, reqAge, reqGender, reqSexual, filter, distance, idme) {
//     let sql = 'SELECT * FROM `users` WHERE id != ' + req.body.id + ' AND (age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ') AND (score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + ") AND (sexual_orientation LIKE '" + reqSexual[0] + "' OR  sexual_orientation LIKE '" + reqSexual[1] + "' OR sexual_orientation LIKE '" + reqSexual[2] + "') AND (gender LIKE '" + reqGender[0] + "' OR gender LIKE '" + reqGender[1] + "' ) AND id NOT IN (SELECT `match` FROM `like` WHERE uid = " + req.body.id + ')' + ' AND `image` != ""'
//     fuckingUltimateReq(sql, filter, distance, idme)
//   }
//   function reqWithoutGender (reqScore, reqAge, reqSexual, filter, distance, idme) {
//     let sql = 'SELECT * FROM `users` WHERE id != ' + req.body.id + ' AND (age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ') AND (score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + ") AND (sexual_orientation LIKE '" + reqSexual[0] + "' OR  sexual_orientation LIKE '" + reqSexual[1] + "' OR sexual_orientation LIKE '" + reqSexual[2] + "') AND id NOT IN (SELECT `match` FROM `like` WHERE uid = " + req.body.id + ')' + ' AND `image` != ""'
//     fuckingUltimateReq(sql, filter, distance, idme)
//   }
//   function reqWithoutSexual (reqScore, reqAge, reqGender, filter, distance, idme) {
//     let sql = 'SELECT * FROM `users` WHERE id != ' + req.body.id + ' AND (age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ') AND (score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + ") AND (gender LIKE '" + reqGender[0] + "' OR gender LIKE '" + reqGender[1] + "' ) AND id NOT IN (SELECT `match` FROM `like` WHERE uid =" + req.body.id + ')' + ' AND `image` != ""'
//     fuckingUltimateReq(sql, filter, distance, idme)
//   }
//   function reqWithoutSexualGender (reqScore, reqAge, filter, distance, idme) {
//     let sql = 'SELECT * FROM `users` WHERE id != ' + req.body.id + ' AND (age BETWEEN ' + reqAge.min + ' AND ' + reqAge.max + ') AND (score BETWEEN ' + reqScore.min + ' AND ' + reqScore.max + ') AND id NOT IN (SELECT `match` FROM `like` WHERE uid =' + req.body.id + ')' + ' AND `image` != ""'
//     fuckingUltimateReq(sql, filter, distance, idme)
//   }
//   function fuckingUltimateReq (req, filter, distance, idme) {
//     if (filter === 'AgeA') {
//       console.log('yo')
//       let finalReq = req + ' ORDER BY age ASC'
//       console.log(finalReq)
//       con.query(finalReq, (err, resu) => {
//         if (err) throw err
//         distances(resu, distance, idme)
//       })
//     } else if (filter === 'AgeD') {
//       let finalReq = req + ' ORDER BY age DESC'
//       con.query(finalReq, (err, resu) => {
//         if (err) throw err
//         distances(resu, distance, idme)
//       })
//     } else if (filter === 'ScoreA') {
//       let finalReq = req + ' ORDER BY score ASC'
//       con.query(finalReq, (err, resu) => {
//         if (err) throw err
//         distances(resu, distance, idme)
//       })
//     } else if (filter === 'ScoreD') {
//       let finalReq = req + ' ORDER BY score DESC'
//       con.query(finalReq, (err, resu) => {
//         if (err) throw err
//         distances(resu, distance, idme)
//       })
//     } else {
//       con.query('SELECT lat, ln FROM users WHERE id = ?', [idme], (err, resu) => {
//         if (err) throw err
//         let tab = []
//         con.query(req, (err, resul) => {
//           if (err) throw err
//           for (let k in resul) {
//             resul[k].distance = getDistanceFromLatLonInKm(resul[k].lat, resul[k].ln, resu[0].lat, resu[0].ln)
//             if (resul[k].distance >= distance.min && resul[k].distance <= distance.max) {
//               tab.push(resul[k])
//               if (parseInt(k, 10) === resul.length - 1) {
//                 res.send(tab)
//                 console.log(tab)
//                 res.send()
//               }
//             }
//           }
//         })
//       })
//     }
//   }
//   function distances (resu, distance, idme) {
//     con.query('SELECT lat, ln FROM users WHERE id = ?', [idme], (err, resul) => {
//       if (err) throw err
//       let tab = []
//       for (let k in resu) {
//         resu[k].distance = getDistanceFromLatLonInKm(resu[k].lat, resu[k].ln, resul[0].lat, resul[0].ln)
//         if (resu[k].distance <= 25) {
//           tab.push(resu[k])
//           if (parseInt(k, 10) === resu.length - 1) {
//             res.send(tab)
//             res.send()
//             console.log(tab)
//           }
//         }
//       }
//     })
//   }
// })

app.post('/search/fetch', (req, res) => {
  let age = req.body.data.value
  let score = req.body.data.score
  let filter = req.body.filter
  let tag = req.body.data.tags

  if (req.body.id) {
    con.query('SELECT * FROM users WHERE id = ?', [req.body.id], (err, resu) => {
      if (err) throw err
      if (resu[0].age !== null && resu[0].image !== null && resu[0].lat !== null && resu[0].ln !== null) {
        if (resu[0].gender === 'Woman' && resu[0].sexual_orientation === 'Heterosexual') {
          let gender = '((gender = "Man" AND sexual_orientation = "Heterosexual") OR (sexual_orientation = "Bisexual" AND gender = "Man"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        } else if (resu[0].gender === 'Man' && resu[0].sexual_orientation === 'Heterosexual') {
          let gender = '((gender = "Woman" AND sexual_orientation = "Heterosexual") OR (sexual_orientation = "Bisexual" AND gender = "Woman"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        } else if (resu[0].gender === 'Man' && resu[0].sexual_orientation === 'Homosexual') {
          let gender = '((gender = "Man" AND sexual_orientation = "Homosexual") OR (sexual_orientation = "Bisexual" AND gender = "Man"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        } else if (resu[0].gender === 'Woman' && resu[0].sexual_orientation === 'Homosexual') {
          let gender = '((gender = "Woman" AND sexual_orientation = "Homosexual") OR (sexual_orientation = "Bisexual" AND gender = "Woman"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        } else if (resu[0].gender === 'Woman' && resu[0].sexual_orientation === 'Bisexual') {
          let gender = '((gender = "Woman" AND sexual_orientation = "Bisexual") OR (gender = "Woman" AND sexual_orientation = "Homosexual") OR (gender = "Man" AND sexual_orientation = "Bisexual") OR (gender = "Man" AND sexual_orientation = "Heterosexual"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        } else if (resu[0].gender === 'Man' && resu[0].sexual_orientation === 'Bisexual') {
          let gender = '((gender = "Man" AND sexual_orientation = "Bisexual") OR (gender = "Man" AND sexual_orientation = "Homosexual") OR (gender = "Woman" AND sexual_orientation = "Bisexual") OR (gender = "Woman" AND sexual_orientation = "Heterosexual"))'
          reqGender(gender, filter, age, score, req.body.id, tag)
        }
      } else {
        // res.send('incomplet')
        res.end()
      }
    })
  } else {
    res.end()
  }
  function reqGender (gender, filter, age, score, id, tag) {
    let block = ' AND id NOT IN (SELECT `match` FROM `like` WHERE uid =' + id + ')'
    let parameters = ' AND ((age BETWEEN ' + age.min + ' AND ' + age.max + ') AND (score BETWEEN ' + score.min + ' AND ' + score.max + '))'
    if (tag.length > 0) {
      tags(gender, filter, parameters, block, id, tag)
    } else {
      filters('null', gender, filter, parameters, block, id)
    }
  }

  function tags (profil, filter, parameters, block, id, tag) {
    let data = null
    for (let p in tag) {
      tags[p] = tag[p].text
      if (data === null) {
        data = "interest LIKE '" + tags[p] + "'"
      } else {
        data += " OR interest LIKE '" + tags[p] + "'"
      }
      if (p.toString() === (tag.length - 1).toString()) {
        let reqTag = 'SELECT uid FROM interest WHERE ' + data
        reqTags(reqTag, profil, filter, parameters, block, id)
      }
    }
  }

  function reqTags (reqTag, profil, filter, parameters, block, idme) {
    let id = []
    con.query(reqTag, (err, resu) => {
      if (err) throw err
      if (resu[0]) {
        let ids = null
        for (let i in resu) {
          id[i] = resu[i].uid
          if (ids == null) {
            ids = "id = '" + id[i] + "'"
          } else {
            ids += " OR id = '" + id[i] + "'"
          }
          if (parseInt(i, 10) === resu.length - 1) {
            let uid = 'SELECT * FROM users WHERE (' + ids + ') AND '
            filters(uid, profil, filter, parameters, block, idme)
          }
        }
      } else {
        filters('null', profil, filter, parameters, block, idme)
      }
    })
  }

  function filters (uid, profil, filter, parameters, block, idme) {
    if (filter === 'AgeA') {
      filter = ' ORDER BY age ASC'
      fuckingUltimateReq(uid, profil, filter, parameters, block, idme)
    } else if (filter === 'AgeD') {
      filter = ' ORDER BY age DESC'
      fuckingUltimateReq(uid, profil, filter, parameters, block, idme)
    } else if (filter === 'ScoreA') {
      filter = ' ORDER BY score ASC'
      fuckingUltimateReq(uid, profil, filter, parameters, block, idme)
    } else if (filter === 'Score D') {
      filter = ' ORDER BY score DESC'
      fuckingUltimateReq(uid, profil, filter, parameters, block, idme)
    } else {
      filter = 'null'
      fuckingUltimateReq(uid, profil, filter, parameters, block, idme)
    }
  }

  function fuckingUltimateReq (uid, profil, filter, parameters, block, idme) {
    if (filter === 'null' && uid !== 'null') {
      console.log('yo')
      con.query(uid + profil + parameters + block, (err, results) => {
        if (err) throw err
        finish(results)
      })
    } else if (filter === 'null' && uid === 'null') {
      con.query('SELECT * FROM users WHERE ' + profil + parameters + block, (err, results) => {
        if (err) throw err
        finish(results)
      })
    } else if (filter !== 'null' && uid === 'null') {
      con.query('SELECT * FROM users WHERE ' + profil + parameters + block + filter, (err, results) => {
        if (err) throw err
        finish(results)
      })
    } else {
      con.query(uid + profil + parameters + block + filter, (err, results) => {
        if (err) throw err
        // res.send(results)
        // res.end()
        finish(results)
      })
    }
  }
  function finish (results) {
    // console.log('ouui')
    let tab = []
    // console.log(results)
    // for (let k in results) {
    //   if (results[k].image !== null) {
    //     // console.log('oui')
    //     tab.push(results[k])
    //     if (parseInt(k, 10) === results.length - 1) {
    //       console.log(tab)
    //       res.send(tab)
    //       res.send()
    //     } else {
    //       console.log(tab)
    //     }
    //   }
    // }
    res.send(results)
    res.send()
  }
})

app.post('/profil/tag/add', (req, res) => {
  let tags = req.body.tag.text
  let id = req.body.id
  if (tags !== null) {
    let sql = 'INSERT INTO interest (interest, uid) VALUES(?, ?)'
    con.query(sql, [tags, id], (err, resul) => {
      if (err) throw err
      let sql = 'SELECT interest from interest WHERE uid = ?'
      con.query(sql, [id], (err, resu) => {
        if (err) throw err
        res.send(resu)
        res.end()
      })
    })
  } else {
    let sql = 'SELECT interest from interest WHERE uid = ?'
    con.query(sql, [id], (err, resu) => {
      if (err) throw err
      res.send(resu)
      res.end()
    })
  }
})

app.post('/profil/tag/delete', (req, res) => {
  let tags = ent.encode(req.body.tags)
  let id = req.body.id
  let sql = 'DELETE FROM interest WHERE uid = ? AND interest = ?'
  con.query(sql, [id, tags], (err, resul) => {
    if (err) throw err
    res.send(resul)
    res.end()
  })
})

app.post('/geolocation', (req, res) => {
  con.query('UPDATE users SET lat = ?, ln = ? WHERE id = ?', [req.body.lat, req.body.ln, req.body.id], (err, resu) => {
    if (err) throw err
  })
  res.end()
})

function getDistanceFromLatLonInKm (lat1, lon1, lat2, lon2) {
  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1) // deg2rad below
  var dLon = deg2rad(lon2 - lon1)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c // Distance in km
  return d
}

function deg2rad (deg) {
  return deg * (Math.PI / 180)
}

app.post('/visit', (req, res) => {
  con.query('SELECT * FROM `notif` WHERE `type` = 1 AND `uid_receiver` = ? AND `seen` = 0', [req.body.uid], (err, result) => {
    if (err) throw err
    res.send(result)
    res.end()
  })
})

app.post('/notiflike', (req, res) => {
  con.query('SELECT * FROM `notif` WHERE `type` = 2 AND `uid_receiver` = ? AND `seen` = 0 ', [req.body.uid], (err, result) => {
    if (err) throw err
    res.send(result)
    res.end()
  })
})

app.post('/notifmatch', (req, res) => {
  con.query('SELECT * FROM `notif` WHERE `type` = 3 AND `uid_receiver` = ? AND `seen` = 0', [req.body.uid], (err, result) => {
    if (err) throw err
    res.send(result)
    res.end()
  })
})

app.post('/notifblock', (req, res) => {
  con.query('SELECT * FROM `notif` WHERE `type` = 4 AND `uid_receiver` = ? AND `seen` = 0', [req.body.uid], (err, result) => {
    if (err) throw err
    res.send(result)
    res.end()
  })
})

app.post('/notifmess', (req, res) => {
  con.query('SELECT * FROM `notif` WHERE `type` = 5 AND `uid_receiver` = ? AND `seen` = 0', [req.body.uid], (err, result) => {
    if (err) throw err
    res.send(result)
    res.end()
  })
})

app.post('/seen', (req, res) => {
  con.query('UPDATE `notif` SET `seen` = 1 WHERE `uid_receiver` = ?', [req.body.uid], (err, result) =>{
    if (err) throw err
    else {
      res.send(null)
      res.end()
    }
  })
})
