import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1f77bc"
    },
    secondary: {
      main: "#5d7888"
    },
    type: "dark"
  },
  overrides: {
    MuiButton: {
      outlined: {
        color: "white"
      }
    }
  },
  images: {
    signIn: "https://www.deputy.com/static/homepage-052019/why-deputy@2x.jpg"
  }
});

export default theme;
