import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import MetricSelect from 'components/experiment/MetricSelect';
import PercentageSlider from 'components/experiment/PercentageSlider';

import API, { Metric } from 'api/api';

const useStyles = makeStyles((theme) => ({
  dialog: {
    overflowY: 'visible',
  },
  dialogContent: {
    width: '600px',
    overflowY: 'visible',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: '8px 0px 12px',
  },
  evaluationMetricsText: {
    marginBottom: '4px',
  },
  errorField: {
    width: '100%',
    textAlign: 'center',
  }
}));

export default function ExperimentFormCopy({
    experimentId,
    updateExperiments,
}: {
  experimentId: number,
  updateExperiments: () => Promise<void>,
}) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [savingValue, setSavingValue] = useState<boolean>(false);
  const [rollout, setRollout] = useState<number>(20);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [errorText, setErrorText] = useState<string>('');

  function resetState() {
    setOpen(false);
    setSavingValue(false);
    setRollout(5);
    setErrorText('');
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function submitForm(element: React.FormEvent) {
    element.preventDefault();
    setSavingValue(true);
    try {
        const userError = await API.startExperiment({
            experiment_id: experimentId,
            percentage: rollout,
            metrics: metrics,
        });

        if (userError) {
            setErrorText(userError);
        } else {
            resetState();
            updateExperiments();
        }
    } catch (e: any) {
        console.error(e);
        setErrorText('This page broke :/');
    } finally {
        setSavingValue(false);
    }
  }

  function handleChangeRollout(_: React.ChangeEvent<{}>, value: number | number[]) {
    setRollout(value as number);
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Start
      </Button>
      <Dialog className={classes.dialog} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Start Experiment</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form className={classes.form} noValidate onSubmit={submitForm}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography component="div" variant="body1">
                  Rollout
                </Typography>
                <PercentageSlider
                  disabled={savingValue}
                  valueLabelDisplay="auto"
                  aria-label="percentage slider"
                  onChange={handleChangeRollout}
                  defaultValue={5} />
              </Grid>
              <Grid item xs={12}>
                <Typography className={classes.evaluationMetricsText} component="div" variant="body1">
                  Evaluation Metrics
                </Typography>
                 <MetricSelect setMetrics={setMetrics} />
              </Grid>
              <Grid item xs={12}>
                <Typography className={classes.errorField} component="div" variant="body2" color="error">
                  {errorText ? errorText : '\u00A0'}
                </Typography>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={savingValue}
            onClick={submitForm}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
