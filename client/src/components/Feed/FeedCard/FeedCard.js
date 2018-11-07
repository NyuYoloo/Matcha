import React, { Component } from 'react'
import axios from 'axios'

import like from '../../../assets/heart.svg'
import dislike from '../../../assets/cancel.svg'
import Female from '../../../assets/femenine.svg'
import Male from '../../../assets/masculine.svg'
import Orien from '../../../assets/genders.svg'
import Trophy from '../../../assets/winner.svg'

import './FeedCard.css'

class FeedCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      img: null
    }
  }
  
    
  onDislike = (e, type) => {
    e.preventDefault()
    const id = localStorage.id
    const id_match = this.props.val.id
    axios.post('/profil/match/dislike', {id, id_match})
    .then((result) => {
      this.props.update()
    })
  }
    
    onLike = (e, type) => {
      e.preventDefault()
      const id = localStorage.id
      const id_match = this.props.val.id
      axios.post('/like', {id, id_match})
      .then((result) => {
        this.props.update()
      })
    }

    render () {
      const val = this.props.val
      return (
        <div className='ContentProfil'>
          <div className='ProfilCard'>
            <div className='ProfilImg'>
              {val['image'] ? <img src={require('../../../../../images/users/' + val['image'])} alt='' className='imgProfil' /> : <img src={require('../../../assets/defprofil.png')} alt='' className='imgProfil' />}
            </div>
            <div className='card-body'>
              <div className='flex-center'>
                <div className=''>
                  {!val ? '' : <h4 className=''>{val['fname']} {val['lname']}</h4>}
                </div>
                {!val ? '' : <div className='ProfilSexual'><img src={Trophy} alt='' className='imgGender'/> <p>{val['score']}</p></div>}
              </div>
              <div className='flex-center'>
                <div className=''>
                  {!val ? '' : val['gender'] === 'Woman' ? <img src={Female} alt='' className='imgGender'/> : <img src={Male} alt='' className='imgGender'/> }
                </div>
                {!val ? '' : <div className='ProfilSexual'><img src={Orien} alt='' className='imgGender'/> <p>{val['sexual_orientation']}</p></div>}
              </div>
              {!val ? '' : <p>{val['age']} years old</p> }
              {!val ? '' : <p>{val['bio']}</p> }
            </div>
            <div className='Card-vote'>
              <img src={like} style={{width: '50px'}} alt='' onClick={this.onLike}/>
              <img src={dislike} style={{width: '50px'}} alt='' onClick={this.onDislike}/>
            </div>
          </div>
      </div>
      )
    }
  }

export default FeedCard
