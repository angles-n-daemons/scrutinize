import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';

import ExplorerControls from 'components/explorer/Controls';
import PerformanceChart from 'components/explorer/Chart';

import API, { PerformanceData} from 'api/api'


export default function PerformancePage() {
    const [performance, setPerformance] = useState<Record<string, PerformanceData>>({ });

    const params = new URLSearchParams(window.location.search);
    const experiment = params.get('experiment') || '';
    useEffect(() => {
        async function getPerformances() {
            setPerformance(await API.getPerformance(experiment));
        }
        getPerformances();
    }, []);

    if (experiment) {
        return (<div>
            <ExplorerControls />
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
