import React, { Component } from 'react'
import axios from 'axios'
import Aux from '../../hoc/Aux'
import ProfilCard from '../../components/Profil/ProfilCard/ProfilCard'
import ProfilContent from '../../components/Profil/ProfilContent/ProfilContent'

class Profil extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: ''
    }
  }
  
  componentDidMount = () => {
    if (!localStorage.id) {
      this.props.history.push('/')
    } else {
      const id = localStorage.id
      axios.post('/profil/getdata', {id})
      .then((result) => {
        this.setState({
          info: result.data
        })
      })
    }
  }

  render () {
    return (
      <Aux>
        <ProfilCard info={this.state.info}/>
        <ProfilContent />
      </Aux>
    )
  }
}

export default Profil
