import React, { Component } from 'react'
import axios from 'axios'
import ProfilCardM from '../../ProfilCardM/ProfilCardM'

class ProfilMatches extends Component {
  constructor (props) {
    super(props)
    this.state = {
      all: null
    }
  }

  componentDidMount = (e) => {
    const id = localStorage.id
    axios.post('/profil/match', { id })
    .then((result) => {
      const all = result.data
      let info = Object.keys(all).map((val, key) =>
      <ProfilCardM key={key} val={all[val]} />
      )
      this.setState({
        all: info
      })
    })
  }

  render () {
    return (
      <div className='test'>
        {this.state.all}
      </div>
    )
  }
}

export default ProfilMatches
