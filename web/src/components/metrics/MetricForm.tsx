import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import API from 'api/api';

export default function MetricForm({
    updateMetrics,
}: {updateMetrics: () => Promise<void>}) {
  const [open, setOpen] = useState(false);
  const [savingValue, setSavingValue] = useState<boolean>(false);
  const [metricName, setMetricName] = useState<string>('');
  const [metricType, setMetricType] = useState<string>('binomial');
  const [errorText, setErrorText] = useState<string>('');

  function resetState() {
    setOpen(false);
    setSavingValue(false);
    setMetricName('');
    setMetricType('binomial');
    setErrorText('');
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeName = (e: any) => {
    setMetricName(e.target.value);
  }

  const handleChangeType = (e: any) => {
    setMetricType(e.target.value);
  }

  async function submitForm(element: React.FormEvent) {
    element.preventDefault();
    setSavingValue(true);
    try {
        if (!metricName) {
            setErrorText('Must include a name for your metric');
            return
        }

        const userError = await API.saveMetric({
            name: metricName,
            type: metricType as any,
        });

        if (userError) {
            setErrorText(userError);
        } else {
            resetState();
            updateMetrics();
        }
    } catch (e: any) {
        console.error(e);
        setErrorText('This page broke :/');
    } finally {
        setSavingValue(false);
    }
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Create Metric
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create Metric</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="metricName"
                variant="outlined"
                required
                fullWidth
                id="metricName"
                label="Metric Name"
                autoFocus
                disabled={savingValue}
                value={metricName}
                onChange={handleChangeName}
              />
              <Typography component="div" variant="body2" color="textSecondary">
                Permitted: letters, numbers, periods and underscores
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <InputLabel id="create-metric-select-type-label">Metric Type</InputLabel>
              <Select
                labelId="create-metric-select-type-label"
                id="create-metric-select-type"
                value={metricType}
                disabled={savingValue}
                onChange={handleChangeType}>
                <MenuItem value={'binomial'}>Binary</MenuItem>
                <MenuItem value={'continuous'}>Continuous</MenuItem>
                <MenuItem value={'count'}>Count</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography component="div" variant="body2" color="error">
                {errorText ? errorText : '\u00A0'}
              </Typography>
            </Grid>
          </Grid>
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
