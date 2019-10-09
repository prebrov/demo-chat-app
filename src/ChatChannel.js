import React, { Component, createRef } from "react";
import Dropzone from "react-dropzone";

import { withStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";

import AttachFileIcon from "@material-ui/icons/AttachFile";
import GroupAddIcon from "@material-ui/icons/GroupAdd";

import useScrollTrigger from "@material-ui/core/useScrollTrigger";

import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { Fab, makeStyles } from "@material-ui/core";
import Zoom from "@material-ui/core/Zoom";

import ChannelDialog from "./ChannelDialog";
import MessageBubble from "./MessageBubble";

const drawerOpen = true;
const drawerHeight = "5em";

const dropzoneRef = createRef();

const styles = theme => ({
  drawer: {
    flexShrink: 0,
    maxHeight: `${drawerHeight}`
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flexGrow: 1,
    marginBottom: `${drawerHeight}`
  },
  row: {
    flexDirection: "row",
    width: "100%",
    flexGrow: 1
  },
  form: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  button: {
    display: "inline-flex",
    height: "50%",
    margin: theme.spacing(1)
  }
});

const useStyles = makeStyles(theme => ({
  zoom: {
    position: "fixed",
    bottom: theme.spacing(12),
    right: theme.spacing(2)
  }
}));

function ScrollTop(props) {
  const { children } = props;
  const classes = useStyles();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = event => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.zoom}>
        {children}
      </div>
    </Zoom>
  );
}

class ChatChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: "",
      messages: [],
      loadingState: "initializing",
      boundChannels: new Set(),
      members: [],
      dialogOpen: false
    };
  }

  loadMessagesFor = thisChannel => {
    if (this.props.channelProxy === thisChannel) {
      thisChannel
        .getMessages()
        .then(messagePaginator => {
          if (this.props.channelProxy === thisChannel) {
            this.setState({
              messages: messagePaginator.items,
              loadingState: "ready"
            });
          }
        })
        .catch(err => {
          console.error("Couldn't fetch messages IMPLEMENT RETRY", err);
          this.setState({ loadingState: "failed" });
        });
    }
  };

  componentDidMount = () => {
    if (this.props.channelProxy) {
      this.loadMessagesFor(this.props.channelProxy);

      getUsers(this.props.channelProxy).then(users=>this.setState({members: users}))

      if (!this.state.boundChannels.has(this.props.channelProxy)) {
        let newChannel = this.props.channelProxy;
        newChannel.on("messageAdded", m => this.messageAdded(m, newChannel));
        this.setState({
          boundChannels: new Set([...this.state.boundChannels, newChannel])
        });
      }
    }
  };

  componentDidUpdate = (oldProps, oldState) => {
    if (this.props.channelProxy !== oldState.channelProxy) {
      this.loadMessagesFor(this.props.channelProxy);

      getUsers(this.props.channelProxy).then(users=>this.setState({members: users}))

      if (!this.state.boundChannels.has(this.props.channelProxy)) {
        let newChannel = this.props.channelProxy;
        newChannel.on("messageAdded", m => this.messageAdded(m, newChannel));
        this.setState({
          boundChannels: new Set([...this.state.boundChannels, newChannel])
        });
      }
    }
  };

  static getDerivedStateFromProps(newProps, oldState) {
    let logic =
      oldState.loadingState === "initializing" ||
      oldState.channelProxy !== newProps.channelProxy;
    if (logic) {
      return {
        loadingState: "loading messages",
        channelProxy: newProps.channelProxy
      };
    } else {
      return null;
    }
  }

  messageAdded = (message, targetChannel) => {
    if (targetChannel === this.props.channelProxy)
      this.setState((prevState, props) => ({
        messages: [...prevState.messages, message]
      }));
  };

  onMessageChanged = event => {
    this.setState({ newMessage: event.target.value });
  };

  sendMessage = event => {
    event.preventDefault();
    const message = this.state.newMessage;
    this.setState({ newMessage: "" });
    this.props.channelProxy.sendMessage(message);
  };

  onDrop = acceptedFiles => {
    console.log(acceptedFiles);
    this.props.channelProxy.sendMessage({
      contentType: acceptedFiles[0].type,
      media: acceptedFiles[0]
    });
  };

  openFileDialog = () => {
    // Note that the ref is set async,
    // so it might be null at some point
    if (dropzoneRef.current) {
      dropzoneRef.current.open();
    }
  };

  openChannelDialog = () => {
    this.setState({ dialogOpen: true });
  }

  render = () => {
    const { classes } = this.props;
    return (
      <div className={classes.messages}>
        <ChannelDialog
          open={this.state.dialogOpen}
          channel={this.props.channelProxy}
          myIdentity={this.props.myIdentity}
          members={this.state.members}
          onMembersChanged={members => {
            // re-fetch all the users
            getUsers(this.props.channelProxy).then(users =>
              this.setState({ members: users })
            );
          }}
          onClose={() => this.setState({ dialogOpen: false })}
        />
        <Dropzone
          ref={dropzoneRef}
          onDrop={this.onDrop}
          accept="image/*"
          noClick
          noKeyboard
        >
          {({ getRootProps, getInputProps, isDragActive }) => (
            <div
              {...getRootProps()}
              className={classes.Dropzone}
              style={
                isDragActive
                  ? {
                      background: `repeating-linear-gradient( -35deg, #eee, #eee 10px, #fff 10px, #fff 20px )`
                    }
                  : {}
              }
            >
              <div className={classes.messages}>
                {this.state.messages.map(m => {
                  if (m.author === this.props.myIdentity)
                    return (
                      <MessageBubble
                        key={m.index}
                        direction="outgoing"
                        message={m}
                      />
                    );
                  else
                    return (
                      <MessageBubble
                        key={m.index}
                        direction="incoming"
                        message={m}
                      />
                    );
                })}
              </div>

              <input id="files" {...getInputProps()} />
            </div>
          )}
        </Dropzone>

        <ScrollTop {...this.props}>
          <Fab color="secondary" size="small" aria-label="scroll back to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </ScrollTop>

        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="bottom"
          open={drawerOpen}
        >
          <div className={classes.row}>
            <form className={classes.form} onSubmit={this.sendMessage}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                type="text"
                name="message"
                id="message"
                disabled={this.state.loadingState !== "ready"}
                onChange={this.onMessageChanged}
                value={this.state.newMessage}
                label="Enter Message..."
                autoComplete="off"
                autoFocus
              />
              <IconButton
                className={classes.button}
                onClick={this.openFileDialog}
              >
                <AttachFileIcon />
              </IconButton>
              <IconButton
                className={classes.button}
                onClick={this.openChannelDialog}
              >
                <GroupAddIcon />
              </IconButton>
              <Button
                variant="contained"
                className={classes.button}
                type="submit"
              >
                Send
              </Button>
            </form>
          </div>
        </Drawer>
      </div>
    );
  };
}

export async function getUsers(channel) {
  const users = await channel.getMembers();
  const resp = await fetch(
    process.env.REACT_APP_CHAT_BACKEND +
      `chat/participant?Channel=${channel.sid}`
  );
  const participants = await resp.json();
  return participants.map((party) => {
    const user = users.find(u => u.state.sid === party.sid);
    return  {
      ...user,
      type: party.messagingBinding ? party.messagingBinding.type : "chat",
      identity: party.messagingBinding
        ? party.messagingBinding.address
        : user.identity,
      proxyAddress: party.messagingBinding
        ? party.messagingBinding.proxy_address
        : null
    };
  });
}


export default withStyles(styles)(ChatChannel);
