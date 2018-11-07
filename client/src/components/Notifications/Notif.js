import React, { Component } from 'react'
import axios from 'axios'
import { Container, Row } from 'mdbreact'
import CustomizedSnackbars from './Notifstyle'
class Notif extends Component {
    constructor(props) {
      super(props)
      this.state = {
          visit: null,
          like: null,
          match: null,
          block: null,
          mess: null
      }
    this.socket = this.props.socket
    window.onbeforeunload= (event) => {
        let uid = localStorage.id
        if (uid){
            axios.post('/seen', {uid})
            .then((result => {
                console.log(result)
            }))
        }
    }
}

componentWillMount = (e) => {
    let uid = localStorage.id
    if (!uid){
        window.location = '/feed'
    } else {
        axios.post('/visit', {uid})
        .then((result) =>{
            const visit = result.data
            if (visit.length > 0) {
                let info = Object.keys(visit).map((val, key) =>
                <CustomizedSnackbars key={key} mess={'Someone has visited your profil'} variant={'info'} />
                // <span key={key} val={visit[val]} >{visit[val].uname} has visited your profil</span>
                )
                this.setState({
                    visit: info
                })
            }
        })
        axios.post('/notiflike', {uid})
        .then((resul) =>{
            const like = resul.data
            if (like.length > 0) {
                let lk = Object.keys(like).map((val, key) =>
                <CustomizedSnackbars key={key} mess={'Someone liked your profil'} variant={'success'} />
                // <span key={key} val={visit[val]} >{visit[val].uname} has visited your profil</span>
                )
                this.setState({
                    like: lk
                })
            }
        })
        axios.post('/notifmatch', {uid})
        .then((resul) =>{
            const match = resul.data
            if (match.length > 0) {
                let mtc = Object.keys(match).map((val, key) =>
                <CustomizedSnackbars key={key} mess={'You have a new match'} variant={'success'} />
                // <span key={key} val={visit[val]} >{visit[val].uname} has visited your profil</span>
                )
                this.setState({
                    match: mtc
                })
            }
        })
        axios.post('/notifblock', {uid})
        .then((resul) =>{
            const block = resul.data
            if (block.length > 0) {
                let blk = Object.keys(block).map((val, key) =>
                <CustomizedSnackbars key={key} mess={'Someone blocked your profil'} variant={'error'} />
                )
                this.setState({
                    block: blk
                })
            }
        })
        axios.post('/notifmess', {uid})
        .then((resul) =>{
            const mess = resul.data
            if (mess.length > 0){
                let msg = Object.keys(mess).map((val, key) =>
                <CustomizedSnackbars key={key} mess={'You have received a new message'} variant={'warning'} />
                // <span key={key} val={visit[val]} >{visit[val].uname} has visited your profil</span>
                )
                this.setState({
                    mess: msg
                })
            } 
        })
    }
}

render () {
    return (
        <Container>
        {/* {this.state.visit ? */}
        <Row>
          {/* <Col md='6'>
            <Card>
              <CardBody>
               <CustomizedSnackbars mess={'Hello World'} variant={'error'} />   
                <div className='content'>
                    {this.state.all}
              </CardBody>
            </Card>
          </Col> */}
          <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}} >
          {this.state.visit}
          {this.state.like}
          {this.state.match}
          {this.state.block}
          {this.state.mess}
          </div>
        </Row>
      </Container>
    )
  }
}

export default Notif
