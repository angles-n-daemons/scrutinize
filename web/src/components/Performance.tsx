import React, { useState, useEffect } from 'react';

import PerformanceInfoBar from 'components/performance/InfoBar';
import PerformanceChart from 'components/performance/Chart';

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
    }, [experiment]);

    if (experiment) {
        return (<div>
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
