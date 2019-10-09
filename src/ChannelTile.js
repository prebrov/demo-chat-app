import React from "react";
import Moment from "react-moment";

import { withStyles } from "@material-ui/styles";
import MenuIcon from "@material-ui/icons/Menu";
import DeleteIcon from "@material-ui/icons/Delete";
import ArchiveIcon from "@material-ui/icons/Archive";

import Badge from "@material-ui/core/Badge";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import AvatarIcon from "./AvatarIcon";
import { getUsers } from "./ChatChannel";

require("promise.allsettled").shim();

const styles = theme => ({
  margin: {
    margin: theme.spacing(1),
    width: "auto"
  },
  paper: props => ({
    padding: theme.spacing(1),
    textAlign: "center",
    background: props.active
      ? theme.palette.background.paper
      : theme.palette.background.default,
    border: `2px solid ${theme.palette.background.paper}`
  }),
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

  deleteChannel = async event => {
    event.preventDefault();
    await fetch(
      process.env.REACT_APP_CHAT_BACKEND +
        `chat/remove?Channel=${this.props.channel.sid}`
    );
  };

  archiveChannel = async event => {
    event.preventDefault();
    const users = await getUsers(this.props.channel);
    // filter all non-admin users
    const removes = users
      .filter(i => i.identity !== this.props.myIdentity)
      .map(u =>
        fetch(
          process.env.REACT_APP_CHAT_BACKEND +
            `chat/remove?Channel=${this.props.channel.sid}&Participant=${u.state.sid}`
        )
      );
    const attributes = encodeURIComponent(
      JSON.stringify({ delivery: "completed" })
    );
    // modify the channel attributes to mark as archived
    removes.push(
      fetch(
        process.env.REACT_APP_CHAT_BACKEND +
          `chat/create?Channel=${this.props.channel.sid}&ChannelAttributes=${attributes}`
      )
    );
    await Promise.allSettled(removes).then(result => {
      let failed = result.find(r => r.status === "rejected");
      if (failed) {
        console.log(failed.reason);
      } else {
        console.log("channel archived");
      }
    });
  };

  render() {
    const { classes, active } = this.props;
    return (
      <Paper className={classes.paper} elevation={active ? 5 : 0}>
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
              {active && (
                <MenuItem onClick={this.archiveChannel}>
                  <ListItemIcon>
                    <ArchiveIcon />
                  </ListItemIcon>
                  <Typography>Archive Channel</Typography>
                </MenuItem>
              )}
              <MenuItem onClick={this.deleteChannel}>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <Typography>Delete Channel</Typography>
              </MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={10}>
            <Badge badgeContent={this.state.messagesCount} color="secondary">
              <Typography variant="h5">
                {this.props.channel.friendlyName}
              </Typography>
            </Badge>
          </Grid>
        </Grid>
        {active && (
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
        )}
        {active && (
          <Typography variant="body2" className={classes.margin}>
            <span>Updated: </span>
            {this.props.channel.lastMessage ? (
              <Moment date={this.props.channel.lastMessage.timestamp} fromNow />
            ) : (
              "n/a"
            )}
          </Typography>
        )}
        {!active && (
          <Typography variant="body2" className={classes.margin}>
            <span>Completed: </span>
            {this.props.channel.dateUpdated ? (
              <Moment date={this.props.channel.dateUpdated} fromNow />
            ) : (
              "n/a"
            )}
          </Typography>
        )}
      </Paper>
    );
  }
}
export default withStyles(styles)(ChannelTile);
