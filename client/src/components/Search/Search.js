import React from 'react'
import InputRange from 'react-input-range'
import { WithContext as ReactTags } from 'react-tag-input'
import { Button } from 'semantic-ui-react'
import axios from 'axios'
import FeedCard from '../Feed/FeedCard/FeedCard'

import './Search.css'
import 'react-input-range/lib/css/index.css'

const KeyCodes = {
  comma: 188,
  enter: 13
}

let placeholders = 'Enter tag'

const delimiters = [KeyCodes.comma, KeyCodes.enter]
class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      info: null,
      // gender: [],
      // sexual: [],
      age: [],
      SortBy: '',
      value: {min: 18, max: 35},
      score: {min: 35, max: 65},
      distance: {min: 0, max: 30}
    }
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddition = this.handleAddition.bind(this)
  }
  handleAddition (tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }))
  }
  handleDelete (i) {
    const { tags } = this.state
    this.setState({
      tags: tags.filter((tag, index) => index !== i)
    })
  }
  
  ageChanged = (age) => {
    this.setState({
      age: age
    });
  }
  
  
  // genderChanged = (gender) => {
  //   this.setState({
  //     gender: gender
  //   });
  // }

  // sexualChanged = (sexual) => {
  //   this.setState({
  //     sexual: sexual
  //   })
  // }

  onSearch = () => {
    const id = localStorage.id
    const data = this.state
    axios.post('/search/fetch', {data, id})
    .then((result) => {
      this.setState({
        info: result.data
      })
    })
  }

  onChange = (e) => {
    const id = localStorage.id
    const data = this.state
    axios.post('/search/fetch', {data, id, filter: e.target.value})
      .then((result) => {
        this.setState({
          info: result.data
        })
      })
  }
  
  componentDidMount = () => {
    if (!localStorage.id) {
      this.props.history.push('/')
    }
  }

  render() {
    let {info, tags} = this.state
    let all = null
    if (info) {
      all = Object.keys(info).map((val, key) =>
      <FeedCard update={this.onSearch} key={key} val={info[val]} />
    )
  }
    return (
      <div className='SearchContent'>
        <div className='ParametersContent'>
          <h1 style={{textAlign: 'center'}}>Search Parameter</h1>
          {/* <div>
            <CheckboxGroup
            checkboxDepth={2}
            name="gender"
            value={this.state.gender}
            onChange={this.genderChanged}>
              <label><Checkbox value='Man'/> Man</label>
              <label><Checkbox value='Woman'/> Woman</label>
            </CheckboxGroup>
            <CheckboxGroup
            checkboxDepth={2}
            name="sexual"
            value={this.state.sexual}
            onChange={this.sexualChanged}>
              <label><Checkbox value='Heterosexual'/> Heterosexual</label>
              <label><Checkbox value='Homosexual'/> Homosexual</label>
              <label><Checkbox value='Bisexual'/> Bisexual</label>
            </CheckboxGroup>
          </div> */}
          <div className=''>
          <InputRange
              draggableTrack
              maxValue={99}
              minValue={18}
              onChange={value => this.setState({ value: value })}
              onChangeComplete={value => console.log(value)}
              value={this.state.value} />
          </div>
          <div className=''>
          <InputRange
              draggableTrack
              maxValue={100}
              minValue={0}
              onChange={value => this.setState({ score: value})}
              value={this.state.score} />
          </div>
          <div className=''>
          <InputRange
              draggableTrack
              maxValue={500}
              minValue={0}
              onChange={value => this.setState({ distance: value})}
              value={this.state.distance} />
          </div>
          <div id='tag' className=''>
                <ReactTags
                  tags={tags}
                  handleDelete={this.handleDelete}
                  handleAddition={this.handleAddition}
                  handleDrag={this.handleDrag}
                  handleTagClick={this.handleTagClick}
                  delimiters={delimiters}
                  placeholder={placeholders}
                  maxLength='10'
                />
          </div>
          <div>
            <Button positive floated='left' value='search' onClick={this.onSearch}>Search</Button>
          </div>
          <div className='select-custom'>
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
        </div>
      <div className='ResultSearch'>
        {all ? all : ''}
      </div>
      </div>
    )
  }
 
}

export default Search
