import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import PerformanceInfoBar from 'components/performance/InfoBar';
import PerformanceChart from 'components/performance/Chart';

import API, { PerformanceData} from 'api/api'

const useStyles = makeStyles({
    root: {
        display: 'flex',
        paddingRight: '15%',
        paddingLeft: '4%',
        flexDirection: 'column',
    },
});


export default function PerformancePage() {
    const [performance, setPerformance] = useState<Record<string, PerformanceData>>({ });

    const classes = useStyles();
    const params = new URLSearchParams(window.location.search);
    const experiment = params.get('experiment') || '';
    useEffect(() => {
        async function getPerformances() {
            setPerformance(await API.getPerformance(experiment));
        }
        getPerformances();
    }, [experiment]);

    if (experiment) {
        return (<div className={classes.root}>
            <PerformanceInfoBar experiment={experiment}/>
            {Object.keys(performance).map((key: string) => {
                const performanceChartProps = {
                    performanceData: performance[key],
                    metricName: key,
                };
                return (<div key={key}>
                    {<PerformanceChart {...performanceChartProps} />}
                </div>)
            })}
        </div>);
    } else {
        return (<div>No experiment selected</div>)
    }
};
