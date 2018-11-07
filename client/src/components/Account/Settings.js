import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import { Form, TextArea, Message } from 'semantic-ui-react'
import axios from 'axios'
import FormValidator from '../FormValidator/FormValidator'

class Settings extends Component {
  constructor (props) {
    super(props)
    this.validator = new FormValidator([
    {
      field: 'lname',
      method: 'isEmpty',
      validWhen: false,
      message: 'Lastname is required.'
    },
    {
      field: 'lname',
      method: 'matches',
      args: [/^[A-Za-z]+$/],
      validWhen: true,
      message: 'Lastname must only contain Alpha characters.'
    },
    {
      field: 'fname',
      method: 'isEmpty',
      validWhen: false,
      message: 'Firstname is required.'
    },
    {
      field: 'fname',
      method: 'matches',
      args: [/^[A-Za-z]+$/],
      validWhen: true,
      message: 'Firstname must only contain Alpha characters.'
    },
    {
      field: 'bio',
      method: 'matches',
      args: [],
      validWhen: true,
      message: 'Bio is not valid'
    },
    {
      field: 'age',
      method: 'matches',
      args: [/\s[0-1]{1}[0-9]{0,2}/],
      validWhen: true,
      message: 'Your age is not valid'
    },
    ])
    this.state = {
      lname : '',
      fname : '',
      age: '',
      gender: '',
      sexual_orientation: '',
      bio: '',
      message: '',
      validation: this.validator.valid(),
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.submitted = false
  }

  onChange = (e) => {
    this.setState( {
        [e.target.name]: e.target.value
    })
  }

  onSubmit = (e) => {
    const validation = this.validator.validate(this.state)
    this.setState({ validation })
    this.submitted = true
    if (validation.isValid) {
      console.log('yo')
        const id = localStorage.id
        const {lname, fname, age, gender, sexual_orientation, bio} = this.state
        axios.post('/settings', {id, lname, fname, age, gender, sexual_orientation, bio})
          .then((result) => {
            if (result.data === 'GOOD') {
              this.setState ({
                message: 'Vos infos ont bien été modifié'
              })
            }
            if (result.data === 'ERROR') {
              this.setState ({
                message: 'Wrong Password'
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
          <Col md="6">
            <Card>
              <CardBody>
                <p className="h4 text-center py-4">Profil</p>
                <div className="grey-text">
                  <div>
                    <Input name="lname" label="Lastname" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} />
                    <span>{validation.lname.message}</span>
                  </div>
                  <div>
                    <Input name="fname" label="Firstname" icon="user" grouptype="text" validate error="wrong" success="right" onChange={this.onChange} />
                    <span>{validation.fname.message}</span>
                  </div>
                  <div>
                    <select className="mdb-select" name='gender' onChange={this.onChange}>
                      <option defaultValue="">Gender</option>
                      <option value="Man">Man</option>
                      <option value="Woman">Woman</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Input name="age" label="Age" icon="" grouptype="text" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.age.message}</span>
                  </div>
                  <div>
                    <select className="mdb-select" name='sexual_orientation' onChange={this.onChange}>
                      <option defaultValue="">Sexual Orientation</option>
                      <option value="Heterosexual">Heterosexual</option>
                      <option value="Homosexual">Homosexual</option>
                      <option value="Bisexual">Bisexual</option>
                    </select>                          
                  </div>
                  <div>
                    <Form>
                      <TextArea placeholder='Tell us more' name='bio' onChange={this.onChange}/>
                    </Form>
                    <span>{validation.bio.message}</span>
                  </div>
                </div>
                <div className="text-center py-4 mt-3">
                  <Button color="cyan" onClick={this.onSubmit}>Submit</Button>
                </div>
                <div>
                    {this.state.message === '' ? '' : <Message floating>{this.state.message}</Message>}
                </div> 
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Settings
