import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

export default function FormDialog() {
  const [open, setOpen] = useState(false);
  const [savingValue, setSavingValue] = useState<boolean>(false);
  const [experimentName, setExperimentName] = useState<string>('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleChangeName = (e: any) => {
    console.log(e)
  }

  const handleClose = () => {
    setOpen(false);
  };

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
                value={experimentName}
                onChange={handleChangeName}
              />
              <Typography component="div" variant="body2" color="textSecondary">
                Permitted: letters, numbers, periods and underscores
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
