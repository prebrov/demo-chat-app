import React from "react";

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
import { Redirect } from "react-router-dom";

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

export default function CreateChannel() {
  const [open, setOpen] = React.useState(true);
  const [name, setName] = React.useState("New Conversation");
  const [addresses, setAddresses] = React.useState([]);
  const [nextRoute, setNextRoute] = React.useState("/");

  const classes = useStyles();

  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  function handleClose() {
    setOpen(false);
  }

  async function handleCreate() {
    const response = await fetch(
      process.env.REACT_APP_CHAT_BACKEND +
        "chat/create?ChannelName=" +
        name
    );
    const channel = await response.json();
    const promises = addresses.map((addr) => {
      const party =
        addr.startsWith("+") ||
        addr.startsWith("messenger") ||
        addr.startsWith("whatsapp")
          ? `Address=${encodeURIComponent(addr)}`
          : `Identity=${encodeURIComponent(addr)}`;
      const url = `${process.env.REACT_APP_CHAT_BACKEND}chat/create?Channel=${channel.sid}&${party}`;
      console.log(url);
      return fetch(url).then((res)=>res.json());
    });
    Promise.all(promises).then(result => {
      console.log(result);
      setNextRoute(`/channels/${channel.sid}`);
      setOpen(false);
    });
  }

  if (!open) {
    return <Redirect to={nextRoute} />;
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
          <DialogTitle disableTypography id="form-dialog-title" className={classes.dialogTitle}>
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
            <AddressInput onChange={setAddresses} addresses={addresses}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleCreate} color="primary">
              Create Conversation
            </Button>
          </DialogActions>
        </Container>
      </Dialog>
    </div>
  );
}
