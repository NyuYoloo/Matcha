import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import axios from 'axios'
import '../../../styles/form.css'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import FormValidator from '../../FormValidator/FormValidator'

class Forgot extends Component {
  constructor(props) {
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
      args: [/^(?=.*[A-Za-z0-9áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ])[áàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸA-Za-z0-9 _-]*$/],
      validWhen: true,
      message: 'Wrong username. Please try again.'
    },
    {
      field: 'email',
      method: 'isEmpty',
      validWhen: false,
      message: 'email is required.'
    },
    {
      field: 'email',
      method: 'isEmail',
      validWhen: true,
      message: 'Wrong email. Please try again.'
    },
    ])
    this.state = {
      login: '',
      email: '',
      validation: this.validator.valid(),
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitted = false
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  onSubmit = (e) => {
    const validation = this.validator.validate(this.state)
    this.setState({ validation })
    this.submitted = true
    if (validation.isValid) {
      const { login, email } = this.state
      axios.post('/forgot', { login, email })
      .then((result) => {
      })
    }
  }

  render() {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <Container>
        <Row>
          <Col md="6">
            <Card>
              <CardBody>
                <p className="h4 text-center py-4">Forgot Password</p>
                <div className="grey-text">
                  <div>
                    <Input name='login' label="Username" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} />
                    <span>{validation.login.message}</span>
                  </div>
                  <div>
                    <Input name='email' label="Your email" icon="envelope" group type="text" validate error="wrong" success="right" onChange={this.onChange} />
                    <span>{validation.email.message}</span>
                </div>
              </div>
              <div className="text-center py-4 mt-3">
                <Button color="cyan" onClick={this.onSubmit}>Send email</Button>
              </div>
              <div className="text-center py-4 mt-3">
                <Button color="cyan" href='/connexion'>back</Button>
              </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
        )
    }
}

export default Forgot
