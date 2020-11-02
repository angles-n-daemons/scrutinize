import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const controlsOptions = [
  'Customer Purchase',
  'Load Time (ms)',
  'Customer Satisfaction',
];

function getStyles(name: any, personName: any, theme: any) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function ExplorerControls() {
  const classes = useStyles();
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
