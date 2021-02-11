import { withStyles, makeStyles } from '@material-ui/core/styles';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

export const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    textAlign: 'left',
  },
  body: {
    fontSize: 14,
    textAlign: 'left',
  },
}))(TableCell);

export const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export const tableStyles = makeStyles({
  root: {
    paddingRight: '8%',
    paddingLeft: '4%',
  },
  header: {
    padding: '20px 0px 27px 0px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  headerText: {
    display: 'inline-block',
  },
  topButton: {
    float: 'right',
  },
  table: {
    minWidth: 700,
  },
});

