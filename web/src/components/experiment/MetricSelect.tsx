import React, { useState, useEffect } from 'react';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import API from 'api/api'

interface MetricSelectProps {
    setMetrics: any;
}

interface AutocompleteOption {
	title: string;
    id: number;
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
                    id: metric.id,
                    title: metric.name,
                };
            }));
        }
        getMetrics();
    }, []);

    function handleChangeMetrics(_: any, values: any) {
		setMetrics(values.map(({ id, title }: AutocompleteOption) => { return { id, name: title } }));
	}

    return (
      <Autocomplete
        multiple
        id="fixed-tags-demo"
        onChange={handleChangeMetrics}
        options={options}
        getOptionLabel={(option: any) => option.title}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={option.title}
              {...getTagProps({ index })}
            />
          ))
        }
        style={{ width: '100%' }}
        renderInput={(params) => (
          <TextField {...params} label="Evaluation Criterion" variant="outlined" placeholder="Select Metrics..." />
        )}
      />
    );
}
