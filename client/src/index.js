import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route } from 'react-router-dom'

import 'react-notifications/lib/notifications.css'
import './components/style.css'
import Aux from './hoc/Aux'
import Toolbar from './components/Toolbar/Toolbar'
import Connexion from './components/Connexion/Connexion'
import Inscription from './components/Inscription/Inscription'
import Search from './components/Search/Search'
import Chat from './components/Chat/Chat'
import Validation from './components/Validation/Validation'
import Forgot from './components/Password/ForgotPassword/ForgotPassword'
import Reset from './components/Password/ResetPassword/ResetPassword'
import Feed from './components/Feed/Feed'
import GetProfil from './components/Profil/GetProfil/GetProfil'
import Account from './components/Account/Account'
import Profil from './container/Profil/Profil'
import Notif from './components/Notifications/Notif'
import io from 'socket.io-client'

const socket = io('localhost:3000')

const Root = () => (
  <Aux>
    <Toolbar socket={socket}/>
    <main>
      <Route exact path='/' component={Inscription} />
      <Route exact path='/connexion' component={Connexion} />
      <Route path='/search' component={Search} />
      <Route exact path='/profil' component={Profil} />
      <Route path='/feed' component={Feed} />
      <Route exact path='/profil/:id' component={props => <GetProfil socket={socket} />} />
      <Route exact path='/account' component={Account} />
      <Route exact path='/chat' component={props => <Chat socket={socket} />} />
      <Route exact path='/validation/:token/:uname' component={Validation} />
      <Route exact path='/forgot_password' component={Forgot} />
      <Route exact path='/reset_password/:token/:uname' component={Reset} />
      <Route exact path='/notif' component={props => <Notif socket={socket} />} />
    </main>
  </Aux>
)

ReactDOM.render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
  , document.getElementById('root'))

// const app = (
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// )

// ReactDOM.render(app, document.getElementById('root'))
