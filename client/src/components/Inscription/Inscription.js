import React from 'react';
import axios from 'axios'
import FormValidator from '../FormValidator/FormValidator'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import '../../styles/form.css'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

class Inscription extends React.Component {
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
        field: 'mail',
        method: 'isEmpty',
        validWhen: false,
        message: 'Email is required.'
      },
      {
        field: 'mail',
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
        method: this.passwordMatch,
        validWhen: true,
        message: 'Password and confirmation password do not match',
      },
      {
        field: 'gender',
        method: 'isEmpty',
        validWhen: false,
        message: 'Gender is required.'
      },
      {
        field: 'sexual_orientation',
        method: 'isEmpty',
        validWhen: false,
        message: 'Sexual_orientation is required.'
      },
    ])
    this.state = {
      uname: '',
      lname: '',
      fname: '',
      mail: '',
      pwd: '',
      cpwd:'',
      gender: '',
      sexual_orientation: '',
      message: '',
      validation: this.validator.valid(),
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.submitted = false
  }

  passwordMatch = (confirmation, state) => (state.pwd === confirmation)

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
      const {uname, lname, fname, mail, pwd, cpwd, gender, sexual_orientation} = this.state
      axios.post('/register', {uname, lname, fname, mail, pwd, cpwd, gender, sexual_orientation})
      .then((result) => {
        if (result.data === 'ERRORL') {
          this.setState({
            message: 'Votre login ou votre adresse email est déjà utilisé !'
          })
        }
        if (result.data === 'GOOD') {
          this.setState ({
            message: 'Vous allez recevoir un email de confirmation !'
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
  
  render() {
    let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
    return (
      <Container>
        <Row>
          <Col md="6">
            <Card>
              <CardBody>
                <p className="h4 text-center py-4">Sign up</p>
                  <div className="grey-text">
                    <div>
                      <Input name='uname' label="Username" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} />
                      <span>{validation.uname.message}</span>
                    </div>
                  <div>                                            
                    <Input name='lname' label="Lastname" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.lname.message}</span>
                  </div>
                  <div>
                    <Input name='fname' label="Fistname" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.fname.message}</span>
                  </div>
                  <div>
                    <Input name='mail' label="Your email" icon="envelope" group type="email" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.mail.message}</span>
                  </div>
                  <div className="select-custom" style={{margin: '10px'}}>
                    <select className="custom-select" name='gender' onChange={this.onChange}>
                      <option defaultValue="">Gender</option>
                      <option value="Man">Man</option>
                      <option value="Woman">Woman</option>
                    </select>
                  </div>
                  <span>{validation.gender.message}</span>
                  <div className="select-custom" style={{margin: '10px'}}>
                    <select name='sexual_orientation' onChange={this.onChange}>
                      <option defaultValue="">Sexual Orientation</option>
                      <option value="Heterosexual">Heterosexual</option>
                      <option value="Homosexual">Homosexual</option>
                      <option value="Bisexual">Bisexual</option>
                    </select>  
                  </div>
                  <span>{validation.sexual_orientation.message}</span>
                  <div>                                            
                    <Input name='pwd' label="Password" icon="lock" group type="password" validate error="wrong" success="right" onChange={this.onChange}/>
                    <span>{validation.pwd.message}</span>
                  </div>
                  <div>    
                    <Input name='cpwd' label="Confirm your password" icon="exclamation-triangle" group type="password" validate onChange={this.onChange}/>
                    <span>{validation.cpwd.message}</span>
                  </div>
                </div>
                <div className="text-center py-4 mt-3">
                  <Button color="cyan" onClick={this.onSubmit}>Register</Button>
                  {/* {this.state.message ? <div style={{textAlign: 'center'}}>Vous avez reçu un email de confirmation !</div> : '' } */}
                </div>
                <div>
                  <span>{this.state.message}</span>
                </div>
                <div className="text-center py-4 mt-3">
                  <Button href="/connexion" color="cyan">Already register ?</Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
};

export default Inscription
