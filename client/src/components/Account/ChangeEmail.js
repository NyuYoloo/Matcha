import React, { Component } from 'react'
import { Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import axios from 'axios'
import FormValidator from '../FormValidator/FormValidator'

class ChangeEmail extends Component {
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
        field: 'newemail',
        method: 'isEmpty',
        validWhen: false,
        message: 'Email is required.'
      },
      {  
        field: 'newemail',
        method: 'isEmail',
        validWhen: true,
        message: 'That is not a valid email.',
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
        method: this.passwordMatch2,
        validWhen: true,
        message: 'Password and confirmation password do not match',
      },
    ])
    this.state = {
      uname: '',
      newemail: '', 
      pwd : '',
      cpwd: '',
      validation: this.validator.valid()
    }
    this.onSubmitMail = this.onSubmitMail.bind(this)
    this.onChange = this.onChange.bind(this)
    this.submitted = false
  }
  passwordMatch2 = (cpwd, state) => (state.pwd === cpwd)

  onChange = (e) => {
    this.setState( {
        [e.target.name]: e.target.value
    })
  }

  onSubmitMail = (e) => {
    const validation = this.validator.validate(this.state)
    this.setState({ validation })
    this.submitted = true
    if (validation.isValid) {
       const login = localStorage.login
       const id = localStorage.id
       const {uname, newemail, pwd, cpwd} = this.state
       axios.post('/changemail', {uname, newemail, pwd, cpwd, id, login})
       .then((result) => {
      })
    }
  }

  render () {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <Row>
        <Col md='6'>
          <Card>
            <CardBody>
              <p className='h4 text-center py-4'>Change Email</p>
              <div className='grey-text'>
                <div>                                            
                  <Input name='uname' label='Your login' icon='user' group type='text' validate error='wrong' success='right' onChange={this.onChange}/>
                  <span>{validation.uname.message}</span>
                </div>
                <div>
                  <Input name='newemail' label='New Email' icon='user' group type='email' validate error='wrong' success='right' onChange={this.onChange}/>
                  <span>{validation.newemail.message}</span>
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
                  <Button color='cyan' onClick={this.onSubmitMail}>Submit</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default ChangeEmail
