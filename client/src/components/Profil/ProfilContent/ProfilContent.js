import React, { Component } from 'react'

import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import Picture from './ProfilPic/ProfilPic'
import ProfilMatches from './ProfilMatches/ProfilMatches'
import ProfilTag from './ProfilTag/ProfilTag'
import './ProfilContent.css'

function TabContainer(props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

class ProfilContent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 0,
    }
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }
  
  render () {
    const { value } = this.state
    return (
      <div className='ProfilContent'>
        <Paper>
          <Tabs value={value} onChange={this.handleChange} indicatorColor='primary' textColor='primary' centered>
            <Tab label='Pictures' />
            <Tab label='Matches' />
            <Tab label='Tag' />
            <Tab label='History' />
          </Tabs>
        </Paper>
        {value === 0 && (
        <TabContainer>
          <Picture />
        </TabContainer>)}
        {value === 1 && (
          <TabContainer>
            <ProfilMatches />
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            <ProfilTag />
          </TabContainer>)}
        {value === 3 && (
          <TabContainer>
          </TabContainer>)}
      </div>
    )
  }
}

export default ProfilContent
