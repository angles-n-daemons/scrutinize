import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import API, { ExperimentDetails} from 'api/api'

function prettyFormatDate(ds: string): string {
    const d = new Date(ds);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const useStyles = makeStyles({
  root: {
	marginTop: '30px',
    marginBottom: '30px',
  },
  detailsCard: {
	marginRight: '15px',
    display: 'inline-block',
  },
  pos: {
    marginBottom: 4,
  },
  center: {
    fontSize: '12px',
	textAlign: 'center',
  },
  tableContainer: {
    width: '60%',
    display: 'inline-block',
  },
  table: {
    minWidth: 650,
  },
});

interface PerformanceInfoBarProps {
    experiment: string;
}

const blankDetails = {
    name: ' ',
    percentage: 0,
    active: false,
    created_time: '1970-01-01',
    last_active_time: '1970-01-01',
    variants: [],
}

export default function PerformanceInfoBar({
	experiment,
}: PerformanceInfoBarProps) {
  const classes = useStyles();
  const [experimentDetails, setExperimentDetails] = useState<ExperimentDetails>(blankDetails);

  useEffect(() => {
      async function getDetails() {
          setExperimentDetails(await API.getDetails(experiment));
      }
      getDetails();
  }, [experiment]);
  const { name, percentage, active, created_time, last_active_time } = experimentDetails;
  return (
    <div className={classes.root}>
      <Card className={classes.detailsCard} variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h3">
            {name}
          </Typography>
          <Typography color="textSecondary">
            rollout: {percentage}%
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            status: { active ? 'active' : 'disabled' }
          </Typography>
        </CardContent>
        <CardContent className={classes.center}>
            {prettyFormatDate(created_time)} to {prettyFormatDate(last_active_time)}
        </CardContent>
      </Card>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Variant</TableCell>
              <TableCell align="right">Volume</TableCell>
              <TableCell align="right">Avg Duration (ms)</TableCell>
              <TableCell align="right">% Error</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {experimentDetails.variants.map((variant) => {
            return (<TableRow key={variant.variant}>
              <TableCell component="th" scope="row">
                {variant.variant}
              </TableCell>
              <TableCell align="right">{variant.volume}</TableCell>
              <TableCell align="right">{parseFloat(variant.duration_ms).toFixed(2)}</TableCell>
              <TableCell align="right">{(parseFloat(variant.pct_error) * 100).toFixed(2)}%</TableCell>
            </TableRow>)
          })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
