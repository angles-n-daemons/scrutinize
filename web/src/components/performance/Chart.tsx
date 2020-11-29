import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Chart } from 'react-google-charts';
import API, { PerformanceData, DataPoint } from 'api/api';

// coefficient for 95% confidence
const Z = 1.960;

interface PerformanceChartProps {
    experiment: string;
    metric: string;
}

const useStyles = makeStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        marginBottom: '25px',
    },
});

export default function PerformanceChart ({
    experiment,
    metric,
}: PerformanceChartProps) {
    const classes = useStyles();

    const [performanceData, setPerformanceData] = useState<PerformanceData>({
        control: [],
        experiment: [],
    });
    const chartData = [];

    useEffect(() => {
        async function getData() {
            setPerformanceData(await API.getPerformance(experiment, metric));
        }
        getData();
    }, [experiment, metric]);

    const experimentDataMap: Record<string, DataPoint> = {};
    for (const dataPoint of performanceData.experiment) {
        experimentDataMap[dataPoint['date']] = dataPoint;
    }
    for (const dataPoint of performanceData.control) {
        const cP = dataPoint;
        var eP: DataPoint = {} as DataPoint;
        if (cP.date in experimentDataMap) {
            eP = experimentDataMap[cP.date];
        }

        const controlConfidence = (Z * (cP.stddev / Math.sqrt(cP.count)));
        const experimentConfidence = (Z * (eP.stddev / Math.sqrt(eP.count)));
        chartData.push([
            new Date(cP.date),
            cP.avg,
            cP.avg - controlConfidence,
            cP.avg + controlConfidence,
            eP.avg,
            eP.avg - experimentConfidence,
            eP.avg + experimentConfidence,
        ]);
    }

    chartData.unshift([
        { type: 'date', label: 'Date' },
        { type: 'number', label: 'Control' },
        { id: 'i0', type: 'number', role: 'interval' },
        { id: 'i0', type: 'number', role: 'interval' },
        { type: 'number', label: 'Experiment' },
        { id: 'i1', type: 'number', role: 'interval' },
        { id: 'i1', type: 'number', role: 'interval' },
    ]);

    return (<div className={classes.root}>
      <Chart
        width={'100%'}
        height={'500px'}
        chartType="LineChart"
        loader={<div>Loading Chart</div>}
        data={chartData}
        options={{
          title: metric,
          curveType: 'function',
          explorer: { 
            actions: ['dragToPan', 'dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 4.0,
          },
          intervals: { color: 'series-color' },
          interval: {
            i0: { color: '#5BE7F8', style: 'area', curveType: 'function', fillOpacity: 0.3 },
            i1: { color: '#F8775B', style: 'area', curveType: 'function', fillOpacity: 0.3 },
          },
          legend: {position: 'bottom', textStyle: {color: 'black', fontSize: 16}}
        }}
        rootProps={{ 'data-id': `${experiment}-${metric}` }}
      />
    </div>);
};
