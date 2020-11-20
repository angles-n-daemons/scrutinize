import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import API from 'api/api'
import MetricForm from 'components/metrics/MetricForm';

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
  metricsHeader: {
    padding: '20px 0px 27px 0px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  metricsHeaderText: {
    display: 'inline-block',
  },
  newMetricButton: {
    float: 'right',
  },
  table: {
    minWidth: 700,
  },
});


export default function MetricList() {
    const classes = useStyles();

    const [metrics, setMetrics] = useState<any[]>([]);

    async function getMetrics() {
        setMetrics(await API.getMetrics());
    }
    useEffect(() => {
        getMetrics();
    }, []);

    return (
      <div className={classes.root}>
        <div className={classes.metricsHeader}>
          <div className={classes.metricsHeaderText}>Metric</div>
          <div className={classes.newMetricButton}>
            <MetricForm updateMetrics={getMetrics} />
          </div>
        </div>
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Metric</StyledTableCell>
                        <StyledTableCell align="right">MetricType</StyledTableCell>
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

