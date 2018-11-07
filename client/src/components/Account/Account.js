import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from "@material-ui/core/Paper";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { Container } from 'mdbreact'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

import ChangePassword from './ChangePassword'
import DeleteAccount from './DeleteAccount'
import Settings from './Settings'
import ChangeEmail from './ChangeEmail'

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

const styles = {
  root: {
    flexGrow: 1
  }
};

class Account extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value : 0
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
  }

  componentDidMount = () => {
    if (!localStorage.id) {
      this.props.history.push('/')
    }
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <div>
        <Paper className={classes.root}>
          <Tabs value={value} onChange={this.handleChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label="Profil" />
            <Tab label="Change Password" />
            <Tab label="Change Email" />
            <Tab label="Delete Account" />
          </Tabs>
        </Paper>
        {value === 0 && (
          <TabContainer>
            <Settings />
          </TabContainer>
        )}
        {value === 1 && <TabContainer>
          <ChangePassword />
        </TabContainer>}
        {value === 2 && <TabContainer>
          <Container>
            <ChangeEmail />
          </Container>  
        </TabContainer>}
        {value === 3 && <TabContainer>
          <DeleteAccount />
        </TabContainer>}
      </div>
    )
  }
}

Account.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Account);
