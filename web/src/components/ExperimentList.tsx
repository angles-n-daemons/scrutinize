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

import API from 'api/api';
import ExperimentForm from 'components/experiment/ExperimentForm';
import StartExperimentForm from 'components/experiment/StartExperimentForm';
import EndExperimentForm from 'components/experiment/EndExperimentForm';

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
});

export default function ExperimentList() {
    const classes = useStyles();

    const [experiments, setExperiments] = useState<any[]>([]);

    async function getExperiments() {
        setExperiments(await API.getExperiments());
    }
    useEffect(() => {
        getExperiments();
    }, []);

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
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell align="right">Rollout</StyledTableCell>
                        <StyledTableCell align="right">Status</StyledTableCell>
                        <StyledTableCell align="right">Activity</StyledTableCell>
                        <StyledTableCell align="right">Description</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {experiments.map((experiment, idx) => {
                    const experimentActivityButton = experiment.active ? 
                        <EndExperimentForm updateExperiments={getExperiments} experimentId={experiment.id}/> :
                        <StartExperimentForm updateExperiments={getExperiments} experimentId={experiment.id}/>;
                    return (
                        <StyledTableRow key={experiment.id}>
                            <StyledTableCell align="right">{ experiment.name }</StyledTableCell>
                            <StyledTableCell align="right">
                                { experiment.active ? `${experiment.percentage}%` : '' }
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                { experiment.active ? "running" : "inactive" }
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                { experimentActivityButton }
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

