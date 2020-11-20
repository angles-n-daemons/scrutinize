import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Switch from '@material-ui/core/Switch';

import { Link } from "react-router-dom";

import API, { Experiment } from 'api/api';
import ExperimentForm from 'components/experiment/ExperimentForm';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    textAlign: 'left',
  },
  body: {
    fontSize: 14,
    textAlign: 'left',
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);


const useStyles = makeStyles({
  root: {
    paddingRight: '8%',
    paddingLeft: '4%',
  },
  experimentsHeader: {
    padding: '20px 0px 27px 0px', 
    fontSize: '24px',
    fontWeight: 'bold',
  },
  experimentsHeaderText: {
    display: 'inline-block',
  },
  newExperimentButton: {
    float: 'right',
  },
  table: {
    minWidth: 700,
  },
  editButton: {
    marginRight: '5px',
  }
});

const TOGGLE_ID_PREFIX = 'active-toggle-';


export default function ExperimentList() {
    const classes = useStyles();

    const [experiments, setExperiments] = useState<any[]>([]);

    async function getExperiments() {
        setExperiments(await API.getExperiments());
    }
    useEffect(() => {
        getExperiments();
    }, []);

    function handleSwitchChange(e: React.SyntheticEvent) {
        const element = (e.target as HTMLInputElement)
        const idxStr = element.id.replace(TOGGLE_ID_PREFIX, '');
        const idx = parseInt(idxStr);
        experiments[idx].active = element.checked;
        const experiment = {
            ...experiments[idx],
            active: element.checked,
        };
        experiments[idx] = experiment;
        setExperiments([...experiments]);
        API.toggleExperimentActive(experiment);
    }

    return (
      <div className={classes.root}>
        <div className={classes.experimentsHeader}>
          <div className={classes.experimentsHeaderText}>Experiments</div>
          <div className={classes.newExperimentButton}>
            <ExperimentForm updateExperiments={getExperiments}/>
          </div>
        </div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Experiment</StyledTableCell>
                        <StyledTableCell align="right">Rollout</StyledTableCell>
                        <StyledTableCell align="right">Start</StyledTableCell>
                        <StyledTableCell align="right">Active</StyledTableCell>
                        <StyledTableCell align="right">Performance</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {experiments.map((experiment, idx) => {
                    return (
                        <StyledTableRow key={experiment.id}>
                            <StyledTableCell align="right">{experiment.name}</StyledTableCell>
                            <StyledTableCell align="right">{experiment.percentage}%</StyledTableCell>
                            <StyledTableCell align="right">{experiment.created_time}</StyledTableCell>
                            <StyledTableCell align="right">
                              <Switch
                                checked={experiment.active}
                                onChange={handleSwitchChange}
                                name={`experiment-active-toggle-${idx}`}
                                id={`${TOGGLE_ID_PREFIX}${idx}`}
                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                              />
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <Button component={Link} to={`/performance?experiment=${experiment.name}`} variant="outlined" color="secondary">Performance</Button>
                            </StyledTableCell>
                        </StyledTableRow>
                    );
                  })}
                </TableBody>
            </Table>
        </TableContainer>
      </div>
    );
}

