import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import theme from "./theme";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { BrowserRouter as Router} from "react-router-dom"

ReactDOM.render(
  <Router>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Router>,
  document.getElementById("root")
);
