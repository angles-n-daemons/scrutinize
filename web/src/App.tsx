import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import GraphicEqIcon from '@material-ui/icons/GraphicEq';
import TimelineIcon from '@material-ui/icons/Timeline';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import { Experiment } from './api/api';
import { ExperimentContext, ExperimentState } from './components/context/Context';
import ExperimentList from './components/ExperimentList';
import MetricList from './components/MetricList';
import PerformancePage from './components/Performance';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

export default function App() {
  const classes = useStyles();
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              scrutinize
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
          <List>
            <ExperimentContext.Provider value={{experiments, setExperiments}}>
              <ListItem component={Link} to='/' button key="ExperimentContext">
                <ListItemIcon><GraphicEqIcon /></ListItemIcon>
                <ListItemText primary="ExperimentContext" />
              </ListItem>
              <ListItem component={Link} to='/metrics' button key="Metrics">
                <ListItemIcon><BlurOnIcon /></ListItemIcon>
                <ListItemText primary="Metrics" />
              </ListItem>
              <ListItem component={Link} to='/performance' button key="Performance">
                <ListItemIcon><TimelineIcon /></ListItemIcon>
                <ListItemText primary="Performance" />
              </ListItem>
            </ExperimentContext.Provider>
          </List>
        </Drawer>

        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/">
              <ExperimentList />
            </Route>
            <Route exact path="/metrics">
              <MetricList />
            </Route>
            <Route path="/performance">
              <PerformancePage />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}
