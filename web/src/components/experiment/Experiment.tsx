import React, { useContext, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import API, { Experiment } from 'api/api';
import { ExperimentContext } from 'components/context/Context';
import ExperimentForm from 'components/experiment/ExperimentForm';
import StartExperimentForm from 'components/experiment/StartExperimentForm';
import EndExperimentForm from 'components/experiment/EndExperimentForm';
import { StyledTableCell, StyledTableRow, tableStyles } from 'components/table/Table';

export default function ExperimentPage() {
    const classes = tableStyles();

    const {experiments, setExperiments} = useContext(ExperimentContext);
    const experiment = experiments[0];

    async function getExperiments() {
        setExperiments(await API.getExperiments());
    }
    useEffect(() => {
        //getExperiments();
    }, []);

    const experimentActivityButton = experiment.active ? 
        <EndExperimentForm updateExperiments={getExperiments} experimentId={experiment.id ?? 1}/> :
        <StartExperimentForm updateExperiments={getExperiments} experimentId={experiment.id ?? 1}/>;
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerText}></div>
          <div className={classes.topButton}>
            { experimentActivityButton }
          </div>
        </div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Run</StyledTableCell>
                        <StyledTableCell align="right">Start Date</StyledTableCell>
                        <StyledTableCell align="right">End Date</StyledTableCell>
                        <StyledTableCell align="right">Rollout</StyledTableCell>
                        <StyledTableCell align="right">Performance</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {[].map((run, idx) => {
                    return (
                        <StyledTableRow key={idx}>
                            <StyledTableCell align="right">{ experiment.name }</StyledTableCell>
                            <StyledTableCell align="right">
                                {}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                {}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                {}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                {}
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

