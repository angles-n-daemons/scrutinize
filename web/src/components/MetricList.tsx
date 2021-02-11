import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import API from 'api/api'
import MetricForm from 'components/metrics/MetricForm';
import { StyledTableCell, StyledTableRow, tableStyles } from 'components/table/Table';

export default function MetricList() {
    const classes = tableStyles();

    const [metrics, setMetrics] = useState<any[]>([]);

    async function getMetrics() {
        setMetrics(await API.getMetrics());
    }
    useEffect(() => {
        getMetrics();
    }, []);

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerText}>Metric</div>
          <div className={classes.topButton}>
            <MetricForm updateMetrics={getMetrics} />
          </div>
        </div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell align="right">Type</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.map((metric, idx) => {
                    return (
                        <StyledTableRow key={metric.id}>
                            <StyledTableCell align="right">{metric.name}</StyledTableCell>
                            <StyledTableCell align="right">{metric.type}</StyledTableCell>
                        </StyledTableRow>
                    );
                  })}
                </TableBody>
            </Table>
        </TableContainer>
      </div>
    );  
}

