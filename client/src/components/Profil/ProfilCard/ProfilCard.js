import React from 'react'
import axios from 'axios'

import GetCoords from '../GetCoords/GetCoords'
import Female from '../../../assets/femenine.svg'
import Male from '../../../assets/masculine.svg'
import Orien from '../../../assets/genders.svg'
import Trophy from '../../../assets/winner.svg'
import './ProfilCard.css'

class profilCard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      img: null
    }
  }

  handlePic = (e) => {
    let take = document.getElementById('takePic')
    take.click()
  }

  openFile = (e) => {
    let input = e.target
    let reader = new FileReader()
    reader.onload = (e) => {
      let output = document.getElementById('new')
      let dataURL = reader.result
      output.src = dataURL
      const id = localStorage.id
      dataURL = output.src
      axios.post('/profil/image/profilpic', {dataURL, id})
      .then((result) => {
      })
    }
    reader.readAsDataURL(input.files[0])
  }

  componentDidMount = () => {
    const id = localStorage.id
    axios.post('/profil/image/display/profilpic', {id})
    .then((result) => {
      this.setState({
          img : result.data
        })
    })
  }

  render () {
    const { img } = this.state
    const val = this.props.info
    return (
      <div className='ContentProfil'>
        <div className='ProfilCard'>
          <div className='ProfilImg'>
            {img ? <img src={img} alt='' className='imgProfil'/> : <img src={require('../../../assets/defprofil.png')} alt='' className='imgProfil' />}
            <img src='' alt='' id='new' style={{display: 'none'}}/>
          </div>
          <div>
            <input id='takePic' type='file' style={{width: '50px', display: 'none'}} onChange={this.openFile} />
            <button onClick={this.handlePic}><i className="fas fa-camera"></i></button>
          </div>
          <div className='card-body'>
            <div className='flex-center'>
              <div className=''>
                {!val ? '' : <h4 className=''>{val[0].fname} {val[0].lname}</h4>}
              </div>
              {!val ? '' : <div className='ProfilSexual'><img src={Trophy} alt='' className='imgGender'/> <p>{val[0].score}</p></div>}
            </div>
            <div className='flex-center'>
              <div className=''>
                {!val ? '' : val[0].gender === 'Woman' ? <img src={Female} alt='' className='imgGender'/> : <img src={Male} alt='' className='imgGender'/> }
              </div>
              {!val ? '' : <div className='ProfilSexual'><img src={Orien} alt='' className='imgGender'/> <p>{val[0].sexual_orientation}</p></div>}
            </div>
            {!val ? '' : val[0].age === null ? <p>IMPORTANT ! Please enter your age.</p> : <p>{val[0].age} years old</p> }
            {!val ? '' : <p>{val[0].bio}</p> }
            <div> <GetCoords /> </div>
          </div>
        </div>
      </div>
    )
  }
}

export default profilCard
