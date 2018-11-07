import React from 'react'
// import createHistory from 'history/createBrowserHistory'
// import Geolocation from 'react-geolocation'
import {geolocated} from 'react-geolocated'
import Geocode from 'react-geocode'

class Test extends React.Component {
  // constructor (props) {
  //   super(props)
  //   this.state = {
  //     latitude: null,
  //     longitude: null
  //   }
  // }

  render () {
    console.log(this.props.coords)
    if (this.props.coords) {
      Geocode.fromLatLng(this.props.coords.latitude, this.props.coords.longitude).then(
        response => {
          const address = response.results[0].formatted_address
          console.log(address)
        },
        error => {
          console.error(error)
        }
      )
      return !this.props.isGeolocationAvailable
        ? <div>Your browser does not support Geolocation</div>
        : !this.props.isGeolocationEnabled
          ? <div>Geolocation is not enabled</div>
          : this.props.coords
            ? <table>
              <tbody>
                <tr><td>latitude</td><td>{this.props.coords.latitude}</td></tr>
                <tr><td>longitude</td><td>{this.props.coords.longitude}</td></tr>
              </tbody>
            </table>
            : <div>Getting the location data&hellip; </div>
    } else {
      return (<div />)
    }
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false
  },
  userDecisionTimeout: 5000
})(Test)
