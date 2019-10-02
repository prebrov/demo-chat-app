import React from "react";
import { withStyles } from "@material-ui/styles";

import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";

import Moment from "react-moment";
import Paper from "@material-ui/core/Paper";

import AvatarIcon from "./AvatarIcon";

import MenuIcon from "@material-ui/icons/Menu";
import DeleteIcon from "@material-ui/icons/Delete";

import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";

import Menu from "@material-ui/core/Menu";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MenuItem from "@material-ui/core/MenuItem";

import { getUsers } from "./ChatChannel";

const styles = theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center"
  },
  tileMenuButton: {
    margin: theme.spacing(-1)
  },
  menuPaper: {
    background: theme.palette.primary.main,
    border: `2px solid ${theme.palette.primary.contrastText}`,
    color: theme.palette.primary.contrastText
  }
});
class ChannelTile extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      users: null,
      messagesCount: 0
    };
  }

  getMessagesCount = async () => {
    return await this.props.channel.getUnconsumedMessagesCount();
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    const users = getUsers(this.props.channel);
    const messagesCount = this.getMessagesCount();
    Promise.all([users, messagesCount]).then(values => {
      if (this._isMounted) {
        this.setState({
          users: values[0],
          messagesCount: values[1]
        });
      }
    });
  }

  openTileMenu = event => {
    event.preventDefault();
    this.setState({ tileMenuAnchor: event.currentTarget });
  };

  closeTileMenu = event => {
    event.preventDefault();
    this.setState({ tileMenuAnchor: null });
  };

  deleteChannel = async (event) => {
    event.preventDefault();
    await fetch(
      process.env.REACT_APP_CHAT_BACKEND +
        `chat/remove?Channel=${this.props.channel.sid}`
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.paper} elevation={5}>
        <Grid container className={classes.margin}>
          <Grid item xs={1}>
            <IconButton
              className={classes.tileMenuButton}
              fontSize="small"
              onClick={this.openTileMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id={"tile-menu-" + this.props.channel.sid}
              anchorEl={this.state.tileMenuAnchor}
              getContentAnchorEl={null}
              keepMounted
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              classes={{
                paper: classes.menuPaper
              }}
              open={Boolean(this.state.tileMenuAnchor)}
              onClose={this.closeTileMenu}
            >
              <MenuItem onClick={this.deleteChannel}>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <Typography>Delete Channel</Typography>
              </MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={11}>
            <Badge
              badgeContent={this.state.messagesCount}
              color="secondary"
            >
              <Typography variant="h5">
                {this.props.channel.friendlyName}
              </Typography>
            </Badge>
          </Grid>
        </Grid>
        <Grid container justify="center" alignItems="center">
          {this.state.users &&
            this.state.users.map(u => (
              <AvatarIcon
                channel={u.type}
                name={u.identity}
                id={u.state.sid}
                key={"icon-" + u.state.sid}
              />
            ))}
        </Grid>
        <Typography variant="body2" className={classes.margin}>
          <span>Last Updated: </span>
          {this.props.channel.lastMessage ? (
            <Moment
              date={this.props.channel.lastMessage.timestamp}
              fromNow
            />
          ) : (
            "n/a"
          )}
        </Typography>
      </Paper>
    );
  }
}
export default withStyles(styles)(ChannelTile);