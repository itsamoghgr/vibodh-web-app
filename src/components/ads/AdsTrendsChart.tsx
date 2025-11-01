'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
} from '@mui/material';

interface AdsTrendsChartProps {
  orgId: string;
  timeRange: number;
  platform: 'all' | 'google_ads' | 'meta_ads';
  refreshKey?: number;
}

interface TrendDataPoint {
  date: string;
  spend: number;
  conversions: number;
  roas: number;
  ctr: number;
}

type MetricView = 'spend' | 'roas' | 'conversions' | 'ctr';

export default function AdsTrendsChart({
  orgId,
  timeRange,
  platform,
  refreshKey = 0
}: AdsTrendsChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<MetricView>('roas');

  useEffect(() => {
    fetchTrendsData();
  }, [orgId, timeRange, platform, refreshKey]);

  const fetchTrendsData = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/ads/trends/${orgId}?days=${timeRange}&platform=${platform}`);
      // const data = await response.json();

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData: TrendDataPoint[] = generateMockData(timeRange);
      setData(mockData);
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (days: number): TrendDataPoint[] => {
    const data: TrendDataPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        spend: Math.random() * 2000 + 1000,
        conversions: Math.floor(Math.random() * 50 + 20),
        roas: Math.random() * 2 + 2.5,
        ctr: Math.random() * 1.5 + 1.5,
      });
    }

    return data;
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  const formatRoas = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  const formatCtr = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const metricConfigs = {
    spend: {
      label: 'Spend',
      dataKey: 'spend',
      color: '#3b82f6',
      format: formatCurrency,
    },
    roas: {
      label: 'ROAS',
      dataKey: 'roas',
      color: '#10b981',
      format: formatRoas,
    },
    conversions: {
      label: 'Conversions',
      dataKey: 'conversions',
      color: '#8b5cf6',
      format: (value: number) => value.toString(),
    },
    ctr: {
      label: 'CTR',
      dataKey: 'ctr',
      color: '#f59e0b',
      format: formatCtr,
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  if (isLoading) {
    return (
      <Box
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Loading trends data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Metric Selector */}
      <Box mb={3}>
        <ButtonGroup variant="outlined" size="small">
          {Object.entries(metricConfigs).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedMetric === key ? 'contained' : 'outlined'}
              onClick={() => setSelectedMetric(key as MetricView)}
            >
              {config.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={currentConfig.format}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value: number) => currentConfig.format(value)}
            />
            <Area
              type="monotone"
              dataKey={currentConfig.dataKey}
              stroke={currentConfig.color}
              strokeWidth={2}
              fill={`url(#color${selectedMetric})`}
              name={currentConfig.label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* Stats Summary */}
      <Box display="flex" gap={3} sx={{ pt: 3, borderTop: 1, borderColor: 'divider', mt: 2 }}>
        <Box flex={1} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Average
          </Typography>
          <Typography variant="h6" fontWeight={600} mt={0.5}>
            {currentConfig.format(
              data.reduce((sum, d) => sum + (d[currentConfig.dataKey as keyof TrendDataPoint] as number), 0) / data.length
            )}
          </Typography>
        </Box>
        <Box flex={1} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Peak
          </Typography>
          <Typography variant="h6" fontWeight={600} mt={0.5}>
            {currentConfig.format(
              Math.max(...data.map(d => d[currentConfig.dataKey as keyof TrendDataPoint] as number))
            )}
          </Typography>
        </Box>
        <Box flex={1} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Lowest
          </Typography>
          <Typography variant="h6" fontWeight={600} mt={0.5}>
            {currentConfig.format(
              Math.min(...data.map(d => d[currentConfig.dataKey as keyof TrendDataPoint] as number))
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
