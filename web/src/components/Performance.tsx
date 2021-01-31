import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import PerformanceInfoBar from 'components/performance/InfoBar';
import PerformanceChart from 'components/performance/Chart';

import API, { ExperimentDetails, Metric } from 'api/api'

const useStyles = makeStyles({
    root: {
        display: 'flex',
        paddingRight: '8%',
        paddingLeft: '4%',
        flexDirection: 'column',
    },
});

export default function PerformancePage() {
    const classes = useStyles();
    const params = new URLSearchParams(window.location.search);
    const runID = params.get('run_id') || '';

    const [details, setDetails] = useState<ExperimentDetails>({
        name: ' ',
        percentage: 0,
        active: false,
        created_time: '1970-01-01',
        last_active_time: '1970-01-01',
        variants: [],
        evaluation_criterion: [],
    });

    useEffect(() => {
        async function getDetails() {
            setDetails(await API.getDetails(runID));
        }
        getDetails();
    }, [runID]);


    if (runID) {
        return (<div className={classes.root}>
            <PerformanceInfoBar details={details} />
            {details.evaluation_criterion.map((metric: Metric) => {
                const performanceChartProps = {
                    runID: runID,
                    metric: metric.name,
                };
                return (<div key={metric.id}>
                    {<PerformanceChart {...performanceChartProps} />}
                </div>)
            })}
        </div>);
    } else {
        return (<div>No experiment selected</div>)
    }
};
