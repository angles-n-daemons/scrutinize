import React from 'react';
import { Chart } from 'react-google-charts';
import { PerformanceData, DataPoint } from 'api/api';

// coefficient for 95% confidence
const Z = 1.960;

interface PerformanceChartProps {
    performanceData: PerformanceData;
    metricName: string;
}

export default function PerformanceChart ({
    performanceData,
    metricName,
}: PerformanceChartProps) {
    var data = [];
    const experimentDataMap: Record<string, DataPoint> = {};
    for (const dataPoint of performanceData.experiment) {
        experimentDataMap[dataPoint['date']] = dataPoint;
    }
    for (const dataPoint of performanceData.control) {
        const cP = dataPoint;
        if (!(cP.date in experimentDataMap)) {
            continue;
        }

        const eP = experimentDataMap[cP.date];
        const controlConfidence = (Z * (cP.stddev / Math.sqrt(cP.count)));
        const experimentConfidence = (Z * (eP.stddev / Math.sqrt(eP.count)));
        data.push([
            new Date(cP.date),
            cP.avg,
            cP.avg - controlConfidence,
            cP.avg + controlConfidence,
            eP.avg,
            eP.avg - experimentConfidence,
            eP.avg + experimentConfidence,
        ]);
    }


    data.unshift([
        { type: 'date', label: 'Date' },
        { type: 'number', label: 'Control' },
        { id: 'i0', type: 'number', role: 'interval' },
        { id: 'i0', type: 'number', role: 'interval' },
        { type: 'number', label: 'Experiment' },
        { id: 'i1', type: 'number', role: 'interval' },
        { id: 'i1', type: 'number', role: 'interval' },
    ]);

    return (<Chart
      width={'100%'}
      height={'500px'}
      chartType="LineChart"
      loader={<div>Loading Chart</div>}
      data={data}
      options={{
        title: metricName,
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
      rootProps={{ 'data-testid': '8' }}
    />);
};
