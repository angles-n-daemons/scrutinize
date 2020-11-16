import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { Link } from "react-router-dom";

import API from 'api/api'

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
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


export default function ExperimentList() {
    const classes = useStyles();

    const [experiments, setExperiments] = useState<any[]>([]);
    useEffect(() => {
        async function getExperiments() {
            const response = await API.getExperiments();
            setExperiments(await response.json());
        }
        getExperiments();
    }, []);

    return (
      <div className={classes.root}>
        <div className={classes.experimentsHeader}>
          <div className={classes.experimentsHeaderText}>Experiments</div>
          <Button className={classes.newExperimentButton} component={Link} to={`/experiment`} variant="contained" color="primary">Create Experiment</Button>
        </div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Experiment</StyledTableCell>
                        <StyledTableCell align="right">Name</StyledTableCell>
                        <StyledTableCell align="right">Percentage</StyledTableCell>
                        <StyledTableCell align="right">Start</StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {experiments.map((experiment) => {
                    return (
                        <StyledTableRow key={experiment.id}>
                            <StyledTableCell component="th" scope="row">
                              {experiment.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{experiment.name}</StyledTableCell>
                            <StyledTableCell align="right">{experiment.percentage}</StyledTableCell>
                            <StyledTableCell align="right">{experiment.created_time}</StyledTableCell>
                            <StyledTableCell align="right">
                                <Button className={classes.editButton} component={Link} to={`/experiment?experiment=${experiment.name}`} variant="outlined" color="primary">Edit</Button>
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

