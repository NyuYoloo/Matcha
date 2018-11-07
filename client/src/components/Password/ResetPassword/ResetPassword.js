import React, { Component } from 'react'
import { Container, Row, Col, Input, Button, Card, CardBody } from 'mdbreact'
import axios from 'axios'
import '../../../styles/form.css'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import FormValidator from '../../FormValidator/FormValidator'

class Reset extends Component {
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
            login: '',
            pwd: '',
            cpwd: '',
            validation: this.validator.valid(),
        }
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.submitted = false
    }

    passwordMatch = (confirmation, state) => (state.pwd === confirmation)

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
            const { login, pwd, cpwd } = this.state
            axios.post('/reset', { login, pwd, cpwd })
                .then((result) => {
                    this.props.history.push('/connexion')
                })
        }
    }

    componentDidMount(){
        axios.get(window.location.pathname)
            .then((result) => {
                console.log(result)
            })
            .catch((error) => {
                console.log(error)
            })      
    }
    render() {
        let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation
        return (
            <Container>
                <Row>
                    <Col md="6">
                        <Card>
                            <CardBody>
                                <p className="h4 text-center py-4">Reset your password</p>
                                <div className="grey-text">
                                    <div>
                                        <Input name='login' label="Username" icon="user" group type="text" validate error="wrong" success="right" onChange={this.onChange} />
                                        <span>{validation.login.message}</span>
                                    </div>
                                    <div>
                                        <Input name='pwd' label="New Password" icon="lock" group type="password" validate error="wrong" success="right" onChange={this.onChange} />
                                        <span>{validation.pwd.message}</span>
                                    </div>
                                    <div>
                                        <Input name='cpwd' label="Confirm your new password" icon="exclamation-triangle" group type="password" validate onChange={this.onChange} />
                                        <span>{validation.cpwd.message}</span>
                                    </div>
                                </div>
                                <div className="text-center py-4 mt-3">
                                    <Button color="cyan" onClick={this.onSubmit}>Reset Password</Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Reset
