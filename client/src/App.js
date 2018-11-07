import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Aux from './hoc/Aux'
import Toolbar from './components/Toolbar/Toolbar'
// import Profil from './components/container/Profil/Profil'
import Connexion from './components/Connexion/Connexion'
// import Feed from './components/Feed/Feed'
// import GetProfil from './components/Profil/GetProfil/GetProfil'
// import Account from './components/Account/Account'
import Inscription from './components/Inscription/Inscription'
// import Search from './components/Search/Search'
// import Chat from './components/Chat/Chat'
// import Validation from './components/Validation/Validation'
// import Forgot from './components/Password/ForgotPassword/ForgotPassword'
// import Reset from './components/Password/ResetPassword/ResetPassword'
import io from 'socket.io-client'

const socket = io('localhost:3000')

class App extends Component {
  render () {
    return (
      <Aux>
        <Toolbar />
        <Switch>
          <Route path='/' component={Inscription}/* component={props => <Inscription socket={socket} /> } */ />
          <Route path='/connexion' component={Connexion} />
          {/* <Route path='/search' component={Search} />
          <Route exact path='/profil' component={Profil} />
          <Route path='/feed' component={Feed} />
          <Route exact path='/profil/:id' component={GetProfil} />
          <Route exact path='/account' component={Account} />
          <Route exact path='/chat' component={props => <Chat socket={socket} />} />
          <Route exact path='/validation/:token/:uname' component={Validation} />
          <Route exact path='/forgot_password' component={Forgot} />
          <Route exact path='/reset_password/:token/:uname' component={Reset} /> */} */}
        </Switch>
      </Aux>
    )
  }
}

export default App
