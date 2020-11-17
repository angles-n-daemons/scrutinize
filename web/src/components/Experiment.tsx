import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import BuildIcon from '@material-ui/icons/Build';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import MetricSelect from 'components/experiment/MetricSelect';
import PercentageSlider from 'components/experiment/PercentageSlider';

import API, { Metric } from 'api/api'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px black solid',
    padding: '15px',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
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

export default function ExperimentForm() {
  const classes = useStyles();
  const history = useHistory();

  const [savingValue, setSavingValue] = useState<boolean>(false);
  const [experimentName, setExperimentName] = useState<string>('');
  const [rollout, setRollout] = useState<number>(5);
  const [metrics, setMetrics] = useState<any>([]);
  const [errorText, setErrorText] = useState<string>('');

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSavingValue(true);
    try {
        if (!experimentName) {
            setErrorText('Must include a name for your experiment');
            return
        }
        const evaluationCriterion = metrics.map((metric: {
            value: string;
            label: string;
        }) => {
            return {
                id: metric.value,
                name: metric.label,
            };
        });
        const userError = await API.saveExperiment({
            name: experimentName,
            percentage: rollout,
            evaluation_criterion: evaluationCriterion,
        });

        if (userError) {
            setErrorText(userError);
        } else {
            history.push('/');
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
    setExperimentName(newName.replace(/[^0-9a-z_\.]/gi, ''));
  }

  function handleChangeRollout(_: React.ChangeEvent<{}>, value: number | number[]) {
    setRollout(value as number);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <BuildIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Experiment
        </Typography>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={savingValue}
          >
            Save
          </Button>
        </form>
      </div>
    </Container>
  );
}
