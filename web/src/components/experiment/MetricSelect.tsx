import React, { useState, useEffect } from 'react';
import Select, { ValueType, OptionTypeBase, ActionMeta } from 'react-select';

import API from 'api/api'

interface MetricSelectProps {
    setMetrics: (value: ValueType<{ label: string; value: string; }>, actionMeta: ActionMeta<{ label: string; value: string; }>) => void;
}

export default function MetricSelect({
    setMetrics
}: MetricSelectProps) {
    const [options, setOptions] = useState<any>([]);

    useEffect(() => {
        async function getMetrics() {
            const apiMetrics = await API.getMetrics();
            setOptions(apiMetrics.map((metric) => {
                return {
                    value: metric.id,
                    label: metric.name,
                };
            }));
        }
        getMetrics();
    }, []);

    if (options && options.length) {
        return (
          <Select
            inputId={'metricsSelector'}
            isMulti
            cacheOptions
            defaultOptions={[]}
            options={options}
            placeholder="Select metrics..."
            onChange={setMetrics}
          />
        );
    }
    return (
      <Select
        inputId={'emptyMetricsSelector'}
        cacheOptions
        isMulti
        defaultOptions={[]}
        placeholder="Select metrics..."
      />
    );
}
