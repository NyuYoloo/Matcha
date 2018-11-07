import React, { Component } from 'react'
import axios from 'axios'
import ProfilPic from '../ProfilPic/Picture/Picture'
import './ProfilPic.css'

class Picture extends Component {
  constructor (props) {
    super(props)
    this.state = {
      img: null,
      upload: true,
    }
    this.handleUpload = this.handleUpload.bind(this)
  }

  handleUpload (ev) {
      let id = localStorage.id
      let dataURL = document.getElementById('new').src
      axios.post('/profil/image/upload', {dataURL, id})
        .then((result) => {
          this.setState({
            upload: false
          })
        })
  }

  openFile = (e) => {
    e.preventDefault()
    let input = e.target
    let reader = new FileReader()
    reader.onload = (e) => {
      let output = document.getElementById('new')
      let dataURL = reader.result
      output.src = dataURL
    }
    reader.readAsDataURL(input.files[0])
  }

  componentWillMount = (e) => {
    const id = localStorage.id
    axios.post('/profil/image/display', {id})
    .then((result) => {
      // console.log(result.data)
      let info = Object.keys(result.data).map((val, key) => 
        <ProfilPic key={key} val={result.data[val]} />
      )
      // console.log(this.state.upload)
      this.setState({
        img: info
      }) 
    })
  }

  render () {
    return (
      <div className='ContentPic'>
        {/* <form> */}
          <div className='form-group'>
            <img src='' alt='' id='new'/>
            <input className='form-control' id='' onChange={this.openFile} type='file' />
          </div>
          <input type='button' className='btn btn-success' value='Upload' onClick={this.handleUpload} />
        {/* </form> */}
        <div className='ProfilPic'>
          {this.state.img}
        </div>
      </div>
    )
  }
}

export default Picture
