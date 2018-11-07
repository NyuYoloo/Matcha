import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import axios from 'axios'

import FormValidator from '../FormValidator/FormValidator'

import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import './Connexion.css'

class Connexion extends Component {
  constructor (props) {
    super(props)
    this.validator = new FormValidator([
    {
      field: 'login',
      method: 'isEmpty',
      validWhen: false,
      message: 'Username is required.'
    },
    {
      field: 'login',
      method: 'matches',
      args: [/^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/],
      validWhen: true,
      message: 'Username not register yet'
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
      message: 'a-z / A-Z / 8 minimum'
    },
    ])
    this.state = {
      login: '',
      pwd: '',
      validation: this.validator.valid(),
      error: false,
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitted = false
  }

  onChange = (e) => {
    this.setState( {
      [e.target.name]: e.target.value
    })
  }
  
  onSubmit = (e) => {
    localStorage.clear()
    const validation = this.validator.validate(this.state)
    this.setState({ validation })
    this.submitted = true
    if (validation.isValid){
      const {login, pwd} = this.state
      axios.post('/connexion', {login, pwd})
      .then((result) => {
        if(result.data.length === 1) {
        localStorage.setItem('login', result.data[0].uname)
        localStorage.setItem('id', result.data[0].id)
        localStorage.setItem('lname', result.data[0].lname)
        localStorage.setItem('fname', result.data[0].fname)
        localStorage.setItem('gender', result.data[0].gender)
        localStorage.setItem('sex', result.data[0].sexual_orientation)
        localStorage.setItem('age', result.data[0].age)
        this.props.history.push('/profil')
        } else {
          this.setState({
            error: true
          })
        }
      })
    }
  }

  componentDidMount = () => {
    if (localStorage.id) {
      this.props.history.push('/profil')
    }
  }
  
  render () {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <Container>
        <Row>
          <Col md="6">
            <Card>
              <CardBody>
                <p className="h4 text-center py-4">Sign in</p>
                <div className="grey-text">
                  <div>                                        
                    <Input name='login' label="Username" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} />                                    
                    <span>{validation.login.message}</span>
                  </div>
                  <div>    
                    <Input name='pwd' label="Password" icon="lock" group type="password" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.pwd.message}</span>
                  </div>
                </div>
                <div className="text-center py-4 mt-3">
                  <Button color="cyan" onClick={this.onSubmit}>Connexion</Button>
                </div>
                {this.state.error ? <div style={{textAlign: 'center'}}>Wrong password or Username, please try again !</div> : '' }
                <div style={{display: 'flex', justifyContent: 'center'}}>
                  <div className="text-center">
                    <Button href="/" color="cyan">Not Register ?</Button>
                  </div>
                  <div className="text-center">
                    <Button href="/forgot_password" color="cyan">Forgot Password ?</Button>
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

export default Connexion
