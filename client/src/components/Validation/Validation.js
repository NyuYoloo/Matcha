import React, { Component } from 'react'
import { Container, Row, Col, Card, CardBody } from 'mdbreact'
import axios from 'axios'
import '../../styles/form.css'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

class Validation extends Component {
/*     constructor (props) {
        super(props)
    } */
  componentDidMount () {
    axios.get(window.location.pathname)
      .then((result) => {
        setTimeout(() => {
          this.props.history.push('/connexion')
        }, 4000)
      })
  }

  render () {
    return (
      <Container>
        <Row>
          <Col md='6'>
            <Card>
              <CardBody>
                <p className='h4 text-center py-4'>Your account has been validated</p><br />
                <p className='h4 text-center py-4'>Please wait a few seconds you will be redirect soon</p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Validation
