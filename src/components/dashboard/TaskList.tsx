'use client';

import { Box, Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface Task {
  id: string;
  date: string;
  project: string;
  company: string;
  completed: boolean;
}

const tasks: Task[] = [
  {
    id: '1',
    date: '24 March 2024',
    project: '2414_VR4sf3#',
    company: 'Creative Tim',
    completed: true,
  },
  {
    id: '2',
    date: '24 March 2024',
    project: '4411_Belsd23',
    company: 'Apple',
    completed: true,
  },
  {
    id: '3',
    date: '25 March 2024',
    project: '8734_HGT721x',
    company: 'Slack',
    completed: false,
  },
  {
    id: '4',
    date: '26 March 2024',
    project: '9852_JKL762v',
    company: 'Microsoft',
    completed: false,
  },
];

export default function TaskList() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate
              color="primary"
              sx={{ 
                color: 'text.secondary',
                '&.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          </TableCell>
          <TableCell>
            <Typography variant="subtitle2" color="text.secondary">
              DATE
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="subtitle2" color="text.secondary">
              PROJECT
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="subtitle2" color="text.secondary">
              COMPANY
            </Typography>
          </TableCell>
          <TableCell align="right" />
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((task) => (
          <TableRow
            key={task.id}
            sx={{
              '&:last-child td, &:last-child th': { border: 0 },
              '&:hover': { bgcolor: 'background.default' },
            }}
          >
            <TableCell padding="checkbox">
              <Checkbox
                checked={task.completed}
                color="primary"
                sx={{
                  color: 'text.secondary',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            </TableCell>
            <TableCell>
              <Typography variant="body2">{task.date}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {task.project}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{task.company}</Typography>
            </TableCell>
            <TableCell align="right">
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 