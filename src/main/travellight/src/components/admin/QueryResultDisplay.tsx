import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Download as DownloadIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

const COLORS = {
  backgroundDark: '#0f0f11',
  backgroundLight: '#18181b',
  backgroundCard: '#1f1f23',
  backgroundSurface: '#27272a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  borderPrimary: '#27272a',
  borderSecondary: '#3f3f46',
  accentPrimary: '#3b82f6',
  accentSecondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};

const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'
];

interface QueryResultDisplayProps {
  data: any;
}

export const QueryResultDisplay: React.FC<QueryResultDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  if (!data.success) {
    return (
      <Alert severity="error" sx={{
        bgcolor: 'rgba(239, 68, 68, 0.1)',
        color: COLORS.danger,
        border: `1px solid rgba(239, 68, 68, 0.3)`,
        '& .MuiAlert-icon': {
          color: COLORS.danger
        }
      }}>
        {data.error}
      </Alert>
    );
  }

  const { title, chartType, data: chartData, rowCount, explanation } = data;

  const downloadCSV = () => {
    if (!chartData || chartData.length === 0) return;

    const headers = Object.keys(chartData[0]).join(',');
    const rows = chartData.map((row: any) =>
      Object.values(row).map((value: any) => `"${value}"`).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChartIcon fontSize="small" />;
      case 'line':
        return <LineChartIcon fontSize="small" />;
      case 'pie':
        return <PieChartIcon fontSize="small" />;
      default:
        return <TableIcon fontSize="small" />;
    }
  };

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <Alert severity="info" sx={{
          bgcolor: 'rgba(6, 182, 212, 0.1)',
          color: COLORS.info,
          border: `1px solid rgba(6, 182, 212, 0.3)`,
          '& .MuiAlert-icon': {
            color: COLORS.info
          }
        }}>
          조회된 데이터가 없습니다.
        </Alert>
      );
    }

    const keys = Object.keys(chartData[0]);
    const numericKeys = keys.filter(key =>
      chartData.some((item: any) => typeof item[key] === 'number')
    );

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderPrimary} />
              <XAxis
                dataKey={keys[0]}
                stroke={COLORS.textMuted}
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
              />
              <YAxis
                stroke={COLORS.textMuted}
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: COLORS.backgroundSurface,
                  border: `1px solid ${COLORS.borderSecondary}`,
                  borderRadius: 4,
                  color: COLORS.textPrimary
                }}
              />
              {numericKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderPrimary} />
              <XAxis
                dataKey={keys[0]}
                stroke={COLORS.textMuted}
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
              />
              <YAxis
                stroke={COLORS.textMuted}
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: COLORS.backgroundSurface,
                  border: `1px solid ${COLORS.borderSecondary}`,
                  borderRadius: 4,
                  color: COLORS.textPrimary
                }}
              />
              {numericKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.map((item: any, index: number) => ({
          name: item[keys[0]],
          value: item[numericKeys[0]] || 0,
          fill: CHART_COLORS[index % CHART_COLORS.length]
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: COLORS.backgroundSurface,
                  border: `1px solid ${COLORS.borderSecondary}`,
                  borderRadius: 4,
                  color: COLORS.textPrimary
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return renderTable();
    }
  };

  const renderTable = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <Typography sx={{ color: COLORS.textSecondary, textAlign: 'center', py: 2 }}>
          조회된 데이터가 없습니다.
        </Typography>
      );
    }

    const columns = Object.keys(chartData[0]);

    return (
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column}
                  sx={{
                    color: COLORS.textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: COLORS.backgroundLight,
                    borderBottom: `1px solid ${COLORS.borderPrimary}`
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.map((row: any, index: number) => (
              <TableRow key={index} hover>
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      color: COLORS.textPrimary,
                      fontSize: '0.75rem',
                      borderBottom: `1px solid ${COLORS.borderPrimary}`
                    }}
                  >
                    {typeof row[column] === 'number'
                      ? row[column].toLocaleString()
                      : row[column]?.toString() || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Paper sx={{
      bgcolor: COLORS.backgroundCard,
      border: `1px solid ${COLORS.borderPrimary}`,
      borderRadius: 1,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${COLORS.borderPrimary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getChartIcon(chartType)}
          <Typography variant="subtitle2" sx={{
            color: COLORS.textPrimary,
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            {title}
          </Typography>
          {rowCount && (
            <Typography variant="caption" sx={{
              color: COLORS.textMuted,
              fontSize: '0.6875rem'
            }}>
              ({rowCount}개 결과)
            </Typography>
          )}
        </Box>

        <Tooltip title="CSV 다운로드">
          <IconButton
            size="small"
            onClick={downloadCSV}
            sx={{ color: COLORS.textSecondary }}
            disabled={!chartData || chartData.length === 0}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {renderChart()}

        {chartType !== 'table' && chartData && chartData.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{
              color: COLORS.textMuted,
              fontSize: '0.6875rem',
              mb: 1,
              display: 'block'
            }}>
              상세 데이터:
            </Typography>
            {renderTable()}
          </Box>
        )}
      </Box>
    </Paper>
  );
};