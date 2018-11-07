import React, { Component } from 'react'
import axios from 'axios'

class Select extends Component {
  constructor (props) {
    super(props)
    this.state = {
      all: this.props
    }
  }

  onChange = (e) => {
    const id = localStorage.id
    const data = this.state
    console.log(data)
    axios.post('/search/fetch', {data, id, filter: e.target.value})
      .then((result) => {
        this.setState({
          all: result.data
        })
      })
  }

  render () {
    console.log(this.state.all)
    return (
      <div>
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
    )
  }
}

export default Select
