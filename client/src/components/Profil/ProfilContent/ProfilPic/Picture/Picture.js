import React, { Component } from 'react'
import axios from 'axios'
import Dustbin from '../../../../../assets/dustbin.svg'
import './Picture.css'

class ProfilPic extends Component {
    constructor (props) {
      super(props)
      this.state = {
        img: this.props.val,
        upload: this.props.upload
      }

    }
    delImg = () => {
      const id = this.state.img.id
      // console.log(this.state.upload)
      axios.post('/profil/imgage/delete', {id})
      .then((result) => {
        // if (result.data.length < 4) {
        //   this.setState({
        //     upload: true
        // //   })
        // } 
      })
    }
  
    render () {
      const val = this.state.img
      return (
        <div className='Picture'>
          <img className='Pic' src={require('../../../../../../../images/users/' + val['post_url'])} alt='' />
          <button onClick={this.delImg}><img src={Dustbin} style={{ width: '45px', height: '45px', padding: '10px'}} alt='' /></button>
        </div>
      )
    }
  }

  export default ProfilPic
