import React, { useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";

import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import theme from "./theme";
import { IconButton, makeStyles, Container } from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";

import AddressInput from "./AddressInput";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flex: "0 1"
  },
  form: {
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
    padding: theme.spacing(3),
    width: "100%"
  },
  dialog: {
    padding: theme.spacing(4)
  }
}));

export default function ChannelDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(
    props.channel ? props.channel.friendlyName : null
  );
  const [addresses, setAddresses] = React.useState([]);

  useEffect(() => {
    // async function fetchUsers() {
    //   const result = await getUsers(props.channel);
    //   return result.map(item => item.identity);
    // }
    // if (props.channel) {
    //   fetchUsers().then(users => setAddresses(users));
    // }
    if (props.members) {
      setAddresses(props.members.map(i=>i.identity));
    }
    setOpen(props.open);
  }, [props.members, props.open]);
  const [nextRoute, setNextRoute] = React.useState("/");

  const classes = useStyles();

  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  function handleClose() {
    setOpen(false);
    props.onClose && props.onClose();
  }

  async function handleCreate() {
    const response = await fetch(
      process.env.REACT_APP_CHAT_BACKEND + "chat/create?ChannelName=" + name
    );
    const channel = await response.json();
    const promises = addresses.map(addr => {
      const party =
        addr.startsWith("+") ||
        addr.startsWith("messenger") ||
        addr.startsWith("whatsapp")
          ? `Address=${encodeURIComponent(addr)}`
          : `Identity=${encodeURIComponent(addr)}`;
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${channel.sid}&${party}`;
      return fetch(url).then(res => res.json());
    });
    Promise.all(promises).then(result => {
      setNextRoute(`/channels/${channel.sid}`);
      handleClose();
    });
  }

  async function handleUpdate() {
    try {
      await fetch(
        `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${props.channel.sid}&ChannelName=${name}`
      )
    } catch (err) {
      console.error(err);
      return
    }
    const memberAddresses = props.members.map(m => m.identity);
    // get added parties
    let added = addresses.filter(x => !memberAddresses.includes(x));
    console.log(added);

    // get removed parties
    let removed = props.members.filter(x => !addresses.includes(x.identity));
    console.log(removed);

    let promises = added.map(addr => {
      const party =
        addr.startsWith("+") ||
        addr.startsWith("messenger") ||
        addr.startsWith("whatsapp")
          ? `Address=${encodeURIComponent(addr)}`
          : `Identity=${encodeURIComponent(addr)}`;
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${props.channel.sid}&${party}`;
      return fetch(url).then(res => res.json());
    });
    promises.concat(removed.map(member => {
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/remove?Channel=${props.channel.sid}&Participant=${member.state.sid}`;
      return fetch(url).then(res => res.json());
    }))
    Promise.all(promises).then(result => {
      props.onMembersChanged && props.onMembersChanged(addresses);
      handleClose()
    });
  }

  return (
    <div>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        fullScreen={fullScreen}
        fullWidth={true}
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        aria-labelledby="form-dialog-title"
      >
        <Container>
          <DialogTitle
            disableTypography
            id="form-dialog-title"
            className={classes.dialogTitle}
          >
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Conversation Name"
              type="text"
              fullWidth
              required
              value={name}
              onChange={event => {
                setName(event.target.value);
              }}
            />
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.form}>
            <AddressInput onChange={setAddresses} addresses={addresses} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            {props.channel ? (
              <Button onClick={handleUpdate} color="primary">
                Update Conversation
              </Button>
            ) : (
              <Button onClick={handleCreate} color="primary">
                Create Conversation
              </Button>
            )}
          </DialogActions>
        </Container>
      </Dialog>
    </div>
  );
}
