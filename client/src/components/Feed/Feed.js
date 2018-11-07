import React, { Component} from 'react'
import axios from 'axios'

import FeedCard from './FeedCard/FeedCard'

import Crying from '../../assets/crying.svg'
import './Feed.css'

class Feed extends Component {
  constructor (props) {
    super(props)
    this.state = {
      all: null,
      SortBy: '',
      filter: null
    }
    this.onChange = this.onChange.bind(this)
    this.Update = this.Update.bind(this)
  }
  componentDidMount = (e) => {
    if (!localStorage.id) {
      this.props.history.push('/')
    } else {
      const id = localStorage.id
      axios.post('/feed/display', { id })
      .then((result) => {
        const all = result.data
        console.log(all)
        let info = Object.keys(all).map((val, key) =>
          <FeedCard update={this.Update} key={key} val={all[val]} />
        )
        this.setState({
          all: info
        })
    })
    }
  }

  onChange = (e) => {
    const id = localStorage.id
    this.setState({
      filter: e.target.value
    })
    axios.post('/feed/display', {id, filter: e.target.value})
      .then((result) => {
        const all = result.data
        let info = Object.keys(all).map((val, key) =>
          <FeedCard update={this.Update} key={key} val={all[val]} />
        )
        this.setState({
          all: info
        })
      })
  }

  Update = (e) => {
    const id = localStorage.id
    axios.post('/feed/display', {id, filter: this.state.filter})
      .then((result) => {
        const all = result.data
        let info = null
        info = Object.keys(all).map((val, key) =>
          <FeedCard update={this.Update} key={key} val={all[val]} />
        )
        this.setState({
          all: info
        })
      })
  }

  render () {
    if (this.state.all !== null) {
      return (
        <div>
        <div className='select-custom' style={{margin: '20px'}}>
          <select name='SortBy' onChange={this.onChange}>
            <option defaultValue=''>Sort By</option>
            <option value='AgeA'>Age (Ascending)</option>
            <option value='AgeD'>Age (Decreasing)</option>
            <option value='ScoreA'>Score (Ascending)</option>
            <option value='ScoreD'>Score (Decreasing)</option>
            <option value='DistanceA'>Distance (Ascending)</option>
            <option value='DistanceD'>Distance (Decreasing)</option>
          </select>
        </div>
        <div className='Feed'>
        {this.state.all}
        </div>
      </div>
      )
    } else {
        return (
          <div style={{textAlign: 'center'}}>
          <p className='text-error'>Aucun résultat ne correspond à votre profil !</p>
          <img src={Crying} alt=''  className='sadness'/>
          </div>
      )
    }
  }
}

export default Feed
