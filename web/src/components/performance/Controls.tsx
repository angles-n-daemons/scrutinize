import React, { useState } from 'react';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

const controlsOptions = [
  'Customer Purchase',
  'Load Time (ms)',
  'Customer Satisfaction',
];

export default function ExplorerControls() {
  const [controls, setControls] = useState<any[]>([]);

  const handleChange = (event: any) => {
    setControls(event.target.value);
  };

  return (
        <Select
            multiple={true}
            value={controls}
            onChange={handleChange}
            input={<Input id='select-multiple' />}
        >
            {controlsOptions.map((name) => {
                return (<MenuItem key={name} value={name}>
                  <Checkbox checked={controls.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>);
            })}
        </Select>
    );
}
