import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import API from 'api/api';

const useStyles = makeStyles((theme) => ({
  dialog: {
    overflowY: 'visible',
  },
  submit: {
    margin: '8px 0px 12px',
  },
  errorField: {
    width: '100%',
    textAlign: 'center',
 },
 dialogActions: {
   display: 'block',
   textAlign: 'center',
 },
}));

export default function ExperimentForm({
    experimentId,
    updateExperiments,
}: {
  experimentId: number,
  updateExperiments: () => Promise<void>,
}) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [savingValue, setSavingValue] = useState(false);
  const [errorText, setErrorText] = useState<string>('');

  function resetState() {
    setOpen(false);
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
        const userError = await API.endExperiment(experimentId);

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

  return (
    <div>
      <Button variant="contained" color="secondary" onClick={handleClickOpen}>
        End
      </Button>
      <Dialog className={classes.dialog} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">End Experiment?</DialogTitle>
        <DialogActions className={classes.dialogActions}>
          <div>
            <Button onClick={handleClose} color="primary">
              No
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={savingValue}
              onClick={submitForm}>
              Yes
            </Button>
          </div>
          <div>
          <Typography className={classes.errorField} component="div" variant="body2" color="error">
            {errorText ? errorText : '\u00A0'}
          </Typography>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}
