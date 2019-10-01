import React from "react";
import { withStyles } from "@material-ui/styles";

import Typography from "@material-ui/core/Typography";
import Badge from "@material-ui/core/Badge";

import Moment from "react-moment";
import Paper from "@material-ui/core/Paper";

import AvatarIcon from "./AvatarIcon";

import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center"
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

  getUsers = async () => {
    const users = await this.props.channel.getMembers();
    const resp = await fetch(
      process.env.REACT_APP_CHAT_BACKEND +
        `chat/participant?Channel=${this.props.channel.sid}`
    );
    const participants = await resp.json();
    return users.map((user, i) => {
      const party = participants.find(p => p.sid === user.sid);
      const merged = {
        ...user,
        type: party.messagingBinding
          ? party.messagingBinding.type
          : "chat",
        identity: party.messagingBinding
          ? party.messagingBinding.address
          : user.identity,
        proxyAddress: party.messagingBinding ? party.messagingBinding.proxyAddress : null
      }
      return merged;
    });
  };

  getMessagesCount = async () => {
    return await this.props.channel.getUnconsumedMessagesCount();
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    const users = this.getUsers();
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

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.paper}>
        <Badge
          className={classes.margin}
          badgeContent={this.state.messagesCount}
          color="secondary"
        >
          <Typography variant="h5">
            {this.props.channel.friendlyName}
          </Typography>
        </Badge>
        <Grid container justify="center" alignItems="center">
          {this.state.users &&
            this.state.users.map(u => (
              <AvatarIcon channel={u.type} name={u.identity} id={u.state.sid} key={"icon-"+ u.state.sid} />
            ))}
        </Grid>
        <Typography variant="body2" className={classes.margin}>
          <span>Last Updated: </span>
          {this.props.channel.lastMessage ? (<Moment
            date={this.props.channel.lastMessage.timestamp}
            durationFromNow
          />): "n/a"}
        </Typography>
      </Paper>
    );
  }
}
export default withStyles(styles)(ChannelTile);
