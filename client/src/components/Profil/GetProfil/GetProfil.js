import React, { Component } from 'react'
import axios from 'axios'
import ProfilCardM from '../../Profil/ProfilCardM/ProfilCardM'

class GetProfil extends Component {
  constructor (props) {
    super(props)
    this.state = {
      all: null,
      img: null
    }
    this.socket = this.props.socket
  }
  
  componentWillMount = (e) => {
    if (!localStorage.id) {
      this.props.history.push('/')
    } else {
      axios.get(window.location.pathname)
      .then((result) => {
        if (result.data !== false) {
        const all = result.data
        let info = Object.keys(all).map((val, key) =>
          <ProfilCardM key={key} val={all[val]} />
        )
        this.setState({
          all: info
        })
        let visited = all[0].id
        let visitor = localStorage.id
        this.socket.emit('visit', {visitor, visited})
        console.log(visited)
        axios.post('/profil/image/display', {id: visited})
        .then((result) => {
          this.setState({
            img: result.data
          })
          console.log(result.data)
        })
      } else {
        window.location = '/profil'
      }
    })
    // axios.post('/profil/image/display', [this])
  }
}


render () {
  console.log(this.state.img)
    // console.log(this.state.all[0].id)
    // console.log(this.state.all)
    if (this.state.all !== null && this.state.img !== null) {
      // console.log(this.state.img[0].post_url)
      return (
        <div>
        <div className='Content'>
          {this.state.all}
        </div>
        <div>
        {this.state.img.length === 0 ? '' : <img src={require('../../../../../images/users/' + this.state.img[0].post_url)} alt='' className='imgProfil' />}
        </div>
        </div>
      )
    }
    else {
      return (
        <div />
      )
    }
  }
}
export default GetProfil
