import React from "react";

import ChipInput from "material-ui-chip-input";

export default function AddressInput(props) {

  function validateInput(value) {
    if (value) {
      if (value.startsWith("whatsapp")) {
        value = value.split(':')[1];
        return value.match(/^\+?[1-9]\d{1,14}$/);
      }
      else if (value.startsWith("messenger")) {
        value = value.split(":")[1];
        return value.match(/^\d+$/);
      } else if (value.startsWith('+')) {
        return value.match(/^\+?[1-9]\d{1,14}$/);
      }
      return true;
    }
  }
  return (
    <ChipInput
      label={"Add Participants (up to 50)"}
      defaultValue={props.addresses}
      fullWidth={true}
      fullWidthInput={false}
      onChange={props.onChange}
      helperText={"Chat username, WhatsApp, Facebook Messenger or E.164"}
      onBeforeAdd={validateInput}
    />
  )
}
