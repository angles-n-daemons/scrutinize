import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import API from 'api/api';
import ExperimentForm from 'components/experiment/ExperimentForm';
import StartExperimentForm from 'components/experiment/StartExperimentForm';
import EndExperimentForm from 'components/experiment/EndExperimentForm';
import { StyledTableCell, StyledTableRow, tableStyles } from 'components/table/Table';

export default function ExperimentList() {
    const classes = tableStyles();

    const [experiments, setExperiments] = useState<any[]>([]);

    async function getExperiments() {
        setExperiments(await API.getExperiments());
    }
    useEffect(() => {
        getExperiments();
    }, []);

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerText}>Experiments</div>
          <div className={classes.topButton}>
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

