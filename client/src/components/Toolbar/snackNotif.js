import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

class SnackNotif extends React.Component {
  state = {
    open: false,
    vertical: 'top',
    horizontal: 'right',
  };

  handleClick = state => () => {
    this.setState({ open: true, ...state });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  componentWillReceiveProps (nextProps) {
      this.setState({
          open: nextProps.open,
          mess: nextProps.mess
      })
  }
  

  render() {
    const { vertical, horizontal, open, mess } = this.state;
    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={this.handleClose}
          autoHideDuration={3000}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{mess}</span>}
        />
      </div>
    );
  }
}

export default SnackNotif;
