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

import API from 'api/api';

const useStyles = makeStyles((theme) => ({
  dialog: {
    overflowY: 'visible',
  },
  dialogContent: {
    overflowY: 'visible',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: '8px 0px 12px',
  },
  errorField: {
    width: '100%',
    textAlign: 'center',
  }
}));

export default function ExperimentForm({
    updateExperiments,
}: {updateExperiments: () => Promise<void>}) {
  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [savingValue, setSavingValue] = useState<boolean>(false);
  const [experimentName, setExperimentName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  function resetState() {
    setOpen(false);
    setSavingValue(false);
    setExperimentName('');
    setDescription('');
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
        if (!experimentName) {
            setErrorText('Must include a name for your experiment');
            return
        }

        const userError = await API.saveExperiment({
            name: experimentName,
            description: description,
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

  function handleChangeName(e: React.ChangeEvent<Element>) {
    const newName = (e.target as HTMLInputElement).value;
    setExperimentName(newName.replace(/[^0-9a-z_.]/gi, ''));
  }

  function handleChangeDescription(e: React.ChangeEvent<{}>) {
    setDescription((e.target as HTMLInputElement).value);
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Create Experiment
      </Button>
      <Dialog className={classes.dialog} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create Experiment</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form className={classes.form} noValidate onSubmit={submitForm}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="experimentName"
                  variant="outlined"
                  required
                  fullWidth
                  id="experimentName"
                  label="Experiment Name"
                  autoFocus
                  disabled={savingValue}
                  value={experimentName}
                  onChange={handleChangeName}
                />
                <Typography component="div" variant="body2" color="textSecondary">
                  Permitted: letters, numbers, periods and underscores
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  variant="outlined"
                  required
                  fullWidth
                  id="description"
                  label="Description"
                  disabled={savingValue}
                  value={description}
                  onChange={handleChangeDescription}
                />
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
