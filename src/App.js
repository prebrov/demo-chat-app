import React, { Component } from "react";
import ChatApp from "./ChatApp";
import SignIn from "./SignIn";

import AppIcon from "./AppIcon";
import AppBar from "@material-ui/core/AppBar";

import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";

import MenuIcon from "@material-ui/icons/Menu";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

import { withStyles } from "@material-ui/styles";
import { NavLink, withRouter } from "react-router-dom";

import Link from "@material-ui/core/Link";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Typography from "@material-ui/core/Typography";

const ForwardNavLink = React.forwardRef((props, ref) => (
  <NavLink {...props} innerRef={ref} />
));

const styles = theme => ({
  root: {
    height: "100vh"
  },
  spacer: {
    flexGrow: 1
  },
  appIcon: {
    width: "10rem",
    margin: "0.5rem",
    height: "auto",
    [theme.breakpoints.down("xs")]: {
      width: "6rem"
    }
  },
  title: {
    color: theme.palette.getContrastText(theme.palette.primary.main)
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    const name = localStorage.getItem("name") || "";
    const loggedIn = name !== "";
    this.state = {
      loggedIn: loggedIn,
      name: name,
      selectedChannel: null
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>

            <Breadcrumbs
              className={classes.title}
              aria-label="breadcrumb"
              separator={<NavigateNextIcon fontSize="small" />}
            >
              <Link color="inherit" to="/" component={ForwardNavLink}>
                <div className={classes.appIcon}>
                  <AppIcon />
                </div>
              </Link>
              {this.state.loggedIn && this.props.location.state && (
                <Typography variant="h5" noWrap>
                  {this.props.location.state.channelName}
                </Typography>
              )}
            </Breadcrumbs>
            <div className={classes.spacer} />
            {this.state.loggedIn && (
              <form onSubmit={this.logOut}>
                <Button
                  variant="outlined"
                  type="submit"
                  color="default"
                  className={classes.logout}
                >
                  Log out
                </Button>
              </form>
            )}
          </Toolbar>
        </AppBar>
        {this.state.loggedIn && <ChatApp name={this.state.name} />}
        {!this.state.loggedIn && (
          <SignIn
            name={this.state.name}
            onNameChanged={this.onNameChanged}
            logIn={this.logIn}
          />
        )}
      </div>
    );
  }

  onNameChanged = event => {
    this.setState({ name: event.target.value });
  };

  logIn = event => {
    event.preventDefault();
    if (this.state.name !== "") {
      localStorage.setItem("name", this.state.name);
      this.setState({ loggedIn: true }, this.getToken);
    }
  };

  logOut = event => {
    this.setState({
      name: "",
      loggedIn: false
    });
    localStorage.removeItem("name");
    this.props.history.push("/");
  };
}

export default withRouter(withStyles(styles)(App));
