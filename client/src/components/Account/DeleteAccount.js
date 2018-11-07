import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import FormValidator from '../FormValidator/FormValidator'
import { Message } from 'semantic-ui-react'
import axios from 'axios'

class DeleteAccount extends Component {
  constructor (props) {
    super(props)
    this.validator = new FormValidator([
      {
        field: 'uname',
        method: 'isEmpty',
        validWhen: false,
        message: 'Username is required.'
      },
      {
        field: 'uname',
        method: 'matches',
        args: [/^(?=.*[A-Za-z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ])[áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸA-Za-z0-9 _-]*$/],
        validWhen: true,
        message: 'Username format is not valid.'
      },
      {
        field: 'pwd',
        method: 'isEmpty',
        validWhen: false,
        message: 'Password is required.'
      },
      {
        field: 'pwd',
        method: 'matches',
        args: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/],
        validWhen: true,
        message: 'Password must contain minimum eight characters, at least one uppercase letter, one lowercase letter and one number.'
      },
      {
        field: 'cpwd',
        method: 'isEmpty',
        validWhen: false,
        message: 'Confirmation is required.'
      },
      {
        field: 'cpwd',
        method: this.passwordMatch,
        validWhen: true,
        message: 'Password and confirmation password do not match',
      },
    ])
    this.state = {
      uname: '',
      pwd : '',
      cpwd: '',
      message: '',
      validation: this.validator.valid()
    }
    this.onSubmitDelete = this.onSubmitDelete.bind(this)
    this.onChange = this.onChange.bind(this)
    this.submitted = false
  }
  passwordMatch = (cpwd, state) => (state.pwd === cpwd)

  onChange = (e) => {
    this.setState( {
        [e.target.name]: e.target.value
    })
  }

  onSubmitDelete = (e) => {
    const validation = this.validator.validate(this.state)
    this.setState({ validation })
    this.submitted = true
    if (validation.isValid) {
      const login = localStorage.login
      const id = localStorage.id
      const {uname, pwd, cpwd} = this.state
      axios.post('/deleteaccount', {uname, pwd, cpwd, id, login})
      .then((result) => {
        console.log(result)
        if (result.data === 'GOOD') {
          localStorage.clear()
          this.setState({
            message: 'Votre compte a bien été supprimé. Vous allez être déconnecté'
          })
          setTimeout(() => {
            window.location = '/connexion'
          }, 4000)
        } else {
          this.setState({
            message: 'Wrong login or password'
          })
        }
      })
    }
  }

  render () {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <Container>
        <Row>
          <Col md='6'>
            <Card>
              <CardBody>
                <p className='h4 text-center py-4'>Delete Account</p>
                <div className='grey-text'>
                  <div>                                            
                    <Input name='uname' label='Your login' icon='user' group type='text' validate error='wrong' success='right' onChange={this.onChange}/>
                    <span>{validation.uname.message}</span>
                  </div>
                  <div>
                    <Input name='pwd' label='Your password' icon='user' group type='password' validate error='wrong' success='right' onChange={this.onChange}/>
                    <span>{validation.pwd.message}</span>
                  </div>
                  <div>
                    <Input name='cpwd' label='Confirm your password' icon='user' group type='password' validate error='wrong' success='right' onChange={this.onChange}/>
                    <span>{validation.cpwd.message}</span>
                  </div>
                  <div className='text-center py-4 mt-3'>
                    <Button color='cyan' onClick={this.onSubmitDelete}>Delete</Button>
                  </div>
                  <div>
                    {this.state.message === '' ? '' : <Message floating>{this.state.message}</Message>}
                </div> 
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}


export default DeleteAccount
