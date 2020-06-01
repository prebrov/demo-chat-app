import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

import signInBackdrop from "./img/grab-hero.jpg";
import logo from "./img/grab-logo-white.svg";

let theme = createMuiTheme({
  palette: {
    primary: {
      main: "#00ba51"
    },
    secondary: {
      main: "#1aae48"
    },
    type: "dark"
  },
  overrides: {
    MuiButton: {
      outlined: {
        color: "white"
      }
    },
    MuiBreadcrumbs: {
      ol: {
        flexWrap: "nowrap"
      }
    }
  },
  images: {
    logo: logo,
    signIn: signInBackdrop
  },
  strings: {
    loginTitle: "Driver communications system",
    openTitle: "Current conversations",
    archivedTitle: "Past conversations"
  }
});

theme = responsiveFontSizes(theme);


export default theme;
