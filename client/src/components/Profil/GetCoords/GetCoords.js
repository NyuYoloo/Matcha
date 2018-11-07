import React, { Component } from 'react'
import {geolocated} from 'react-geolocated'
import axios from 'axios'
import Geocode from 'react-geocode'
import geolib from 'geolib'

class GetCoords extends Component {
  constructor (props) {
    super(props)
    this.state = {
      address: '',
      latitude: ''
    }
  }
  
  componentDidMount () {
    const id = localStorage.id
    navigator.geolocation.getCurrentPosition((position, error) => {
      let lat = position.coords.latitude
      let ln = position.coords.longitude
      let dist = geolib.getDistance(
        {latitude: lat, longitude: ln},
        {latitude: 48.996682600000005, longitude: 2.418352}
      )
      console.log(dist)
      console.log(lat, ln)
      axios.post('/geolocation', {id, lat, ln})
        .then((result) => {
          Geocode.fromLatLng(lat, ln).then(
            response => {
              const address = response.results[0].formatted_address
              this.setState({
                address: address
              })
            },
            error => {
              console.error(error)
            }
          )
        })
    })
  }

  render () {
    return (
      <p>{this.state.address}</p>
    )
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false
  }
})(GetCoords)
