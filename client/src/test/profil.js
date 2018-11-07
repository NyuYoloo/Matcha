import React, { Component} from 'react'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import './styles/profil.css'
import {Grid, Col, Row} from 'react-bootstrap/lib/'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import 'react-images-uploader/styles.css'
import 'react-images-uploader/font.css'
import { WithContext as ReactTags } from 'react-tag-input'
import Watson from './img/watson.jpg'
import Loc from './img/location.png'
import axios from 'axios'
import './styles/global.css'
import ProfilCard from './component/profilCard'
import ProfilPic from './component/profilPic'
import GetCoords from './component/getCoords'


  const styles = {
    root: {
      flexGrow: 1
    }
  }

  const KeyCodes = {
    comma: 188,
    enter: 13,
  }
   
  const delimiters = [KeyCodes.comma, KeyCodes.enter]

  function TabContainer(props) {
    return (
      <Typography component='div' style={{ padding: 8 * 3 }}>
        {props.children}
      </Typography>
    )
  }
  class Profil extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: 0,
            all: null,
            img: null,
            tags: [],
            suggestions: [
              { id: 'USA', text: 'USA' },
              { id: 'Germany', text: 'Germany' },
              { id: 'Austria', text: 'Austria' },
              { id: 'Costa Rica', text: 'Costa Rica' },
              { id: 'Sri Lanka', text: 'Sri Lanka' },
              { id: 'Thailand', text: 'Thailand' }
           ]
        }
        this.handleDelete = this.handleDelete.bind(this)
        this.handleAddition = this.handleAddition.bind(this)
        this.handleDrag = this.handleDrag.bind(this)
        this.handleUpload = this.handleUpload.bind(this)
      }
      
  handleChange = (event, value) => {
    this.setState({ value })
  }

  // CHIPS / TAG
  handleDelete(i) {
    const { tags } = this.state
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    })
    const id = localStorage.id
    axios.post('/deltags', {tags, id})
    .then((result) => {
      console.log('ok')
    })
  }

  handleAddition = (tag) =>  {
      this.setState(state => ({ tags: [...state.tags, tag] }))
      const id = localStorage.id
      axios.post('/addtags', {tag, id})
      .then((result) => {
      })
  }

  handleDrag(tag, currPos, newPos) {
      const tags = [...this.state.tags]
      const newTags = tags.slice()

      newTags.splice(currPos, 1)
      newTags.splice(newPos, 0, tag)

      this.setState({ tags: newTags })
  }

  
  // UPLOAD FILES

  // handleUpload(ev) {
  //   ev.preventDefault()
  //   const data = new FormData()
  //   data.append('file', this.uploadInput.files[0])
  //   // data.append('filename', this.fileName.value)
  //   data.append('uid', localStorage.id)
  //   axios.post('file-upload', data)
  //   .then((result) => {
  //     console.log(result)
  //   })
  //   .catch((error) => {
  //       console.log(error)
  //     })
  // }

  // MATCH
    
  componentDidMount = (e) => {
    const id = localStorage.id
    axios.post('/match', { id })
    .then((result) => {
      const all = result.data
      // console.log(all)
      let info = Object.keys(all).map((val, key) =>
      <ProfilCard key={key} val={all[val]} />
      )
      this.setState({
        all: info
      })
    })
    axios.post('/image', {id})
    .then((result) => {
      // console.log(result.data)
      let info = Object.keys(result.data).map((val, key) => 
        <ProfilPic key={key} val={result.data[val]} />
      )
      this.setState({
        img: info
      })
    })
  }

  render () {
    const { tags, suggestions } = this.state
    const { classes } = this.props
    const { value } = this.state
    return (
      <div className='main-content'>
        <div className='content-profile'>
          <div className='content-header-profile'>
            <Grid>
              <Row>
                <Col xs={6} md={4}>
                  <div className='card mb-4 test2'>
                    <div className='card-img text-center'>
                      <img src={Watson} alt='' />
                    </div>
                    <div className='card-body'>
                      <h4 className='card-title'>{localStorage.fname} {localStorage.lname}</h4>
                      <p className='card-text text-center'>{localStorage.gender} {localStorage.sex} {localStorage.age}</p>
                      <p className='card-text'>Some quick example text to build on the card title and make up the bulk of the card's content.</p>  
                    </div>
                    <div className='flex'>
                  <p>{<GetCoords />}</p>
                      <button><img style={{width: '35px'}} src={Loc}/></button>
                    </div>
                  </div>
                      {/* <ReactTags tags={tags}
                        suggestions={suggestions}
                        handleDelete={this.handleDelete}
                        handleAddition={this.handleAddition}
                        handleDrag={this.handleDrag}
                        delimiters={delimiters} 
                        maxLength = '10'/>
                      </div>
                    </div>
                  </div> */}
                </Col>
              </Row>
            </Grid>
          </div>
          <div className='content-page'>
            <Paper className={classes.root}>
              <Tabs value={value} onChange={this.handleChange} indicatorColor='primary' textColor='primary' centered>
                <Tab label='Pictures' />
                <Tab label='Matches' />
                <Tab label='Tag' />
                <Tab label='History' />
              </Tabs>
            </Paper>
            {value === 0 && (
            <TabContainer className='flex'>
              <div style= {{width: '240px'}}>
                <form onSubmit={this.handleUpload}>
                  <div className="form-group">
                  <input className="form-control"  ref={(ref) => { this.uploadInput = ref }} type="file" />
                </div>
                <button className="btn btn-success" type>Upload</button>
              </form>
              </div>
              <div className='flex'>
                {this.state.img}
              </div>
            </TabContainer>)}
            {value === 1 && (
              <TabContainer>
                <div className='test'>
                  {this.state.all}
                </div>
              </TabContainer>
            )}
            {value === 2 && (
            <TabContainer>
              <ReactTags tags={tags}
                suggestions={suggestions}
                handleDelete={this.handleDelete}
                handleAddition={this.handleAddition}
                handleDrag={this.handleDrag}
                delimiters={delimiters} 
                maxLength = '10'/>    
            </TabContainer>)}
            {value === 3 && (
            <TabContainer>
            </TabContainer>)}
          </div>
        </div>
      </div>
    )
  }
}

Profil.propTypes = {
    classes: PropTypes.object.isRequired
  }
  
  export default withStyles(styles)(Profil)
