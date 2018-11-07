import React, { Component } from 'react'
import { WithContext as ReactTags } from 'react-tag-input'
import axios from 'axios'

import './ProfilTag.css'

const KeyCodes = {
  comma: 188,
  enter: 13
}

let placeholders = 'Add a new hobbie'

const delimiters = [KeyCodes.comma, KeyCodes.enter]

class ProfilTag extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tags: [],
      display: []
    }
    this.handleDelete = this.handleDelete.bind(this)
    this.handleAddition = this.handleAddition.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleTagClick = this.handleTagClick.bind(this)
  }

  handleDelete (i) {
    const { tags } = this.state
    this.setState({
      tags: tags.filter((tag, index) => index !== i)
    })
    const id = localStorage.id
    if (this.state.tags.length > 0) {
      axios.post('/profil/tag/delete', {tags: tags[i]['text'], id})
        .then((result) => {
        })
    }
  }

  componentWillMount () {
    const id = localStorage.id
    axios.post('/profil/tag/add', {tag: {id: null, text: null}, id})
      .then((result) => {
        let info = result.data
        info.map((interest, i) => {
          this.setState(state => ({ tags: [...state.tags, {id: interest['interest'], text: interest['interest']}] }))
          return null
        })
        this.setState({
          display: [info]
        })
      })
  }

  handleAddition (tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }))
    const id = localStorage.id
    axios.post('/profil/tag/add', {tag, id})
      .then((result) => {
        let info = result.data
        this.setState({
          display: [info]
        })
      })
  }

  handleDrag (tag, currPos, newPos) {
    const tags = [...this.state.tags]
    const newTags = tags.slice()

    newTags.splice(currPos, 1)
    newTags.splice(newPos, 0, tag)

    this.setState({ tags: newTags })
  }

  handleTagClick (index) {
    console.log('The tag at index ' + index + ' was clicked')
  }

  render () {
    const { tags, display } = this.state
    if (display[0]) {
      display[0].map((interest, i) => (
        <p key={i}>{interest['interest']}</p>
      ))
    }
    return (
      <div id='tag'>
        <h4>Veuillez choisir 5 tags</h4>
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
    )
  }
}

export default ProfilTag
