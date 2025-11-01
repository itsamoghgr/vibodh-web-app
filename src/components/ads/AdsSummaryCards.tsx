'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as DollarIcon,
  ShowChart as ChartIcon,
  TrackChanges as TargetIcon,
  TouchApp as ClickIcon,
} from '@mui/icons-material';

interface AdsSummaryCardsProps {
  orgId: string;
  timeRange: number;
  platform: 'all' | 'google_ads' | 'meta_ads';
  refreshKey?: number;
}

interface SummaryMetrics {
  totalSpend: number;
  avgRoas: number;
  totalConversions: number;
  avgCtr: number;
  spendChange: number;
  roasChange: number;
  conversionsChange: number;
  ctrChange: number;
}

export default function AdsSummaryCards({
  orgId,
  timeRange,
  platform,
  refreshKey = 0
}: AdsSummaryCardsProps) {
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    totalSpend: 0,
    avgRoas: 0,
    totalConversions: 0,
    avgCtr: 0,
    spendChange: 0,
    roasChange: 0,
    conversionsChange: 0,
    ctrChange: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummaryMetrics();
  }, [orgId, timeRange, platform, refreshKey]);

  const fetchSummaryMetrics = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/ads/summary/${orgId}?days=${timeRange}&platform=${platform}`);
      // const data = await response.json();

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData: SummaryMetrics = {
        totalSpend: 45250.50,
        avgRoas: 3.85,
        totalConversions: 1247,
        avgCtr: 2.34,
        spendChange: -5.2,
        roasChange: 12.5,
        conversionsChange: 18.3,
        ctrChange: 3.7,
      };

      setMetrics(mockData);
    } catch (error) {
      console.error('Error fetching summary metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const renderChangeIndicator = (change: number) => {
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const color = isPositive ? 'success' : 'error';

    return (
      <Chip
        icon={<Icon />}
        label={`${Math.abs(change).toFixed(1)}%`}
        color={color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  const cards = [
    {
      title: 'Total Spend',
      value: formatCurrency(metrics.totalSpend),
      change: metrics.spendChange,
      icon: DollarIcon,
      description: `Last ${timeRange} days`,
      iconColor: '#3b82f6',
      iconBg: '#dbeafe',
    },
    {
      title: 'Avg ROAS',
      value: `${metrics.avgRoas.toFixed(2)}x`,
      change: metrics.roasChange,
      icon: ChartIcon,
      description: 'Return on ad spend',
      iconColor: '#10b981',
      iconBg: '#d1fae5',
    },
    {
      title: 'Total Conversions',
      value: formatNumber(metrics.totalConversions),
      change: metrics.conversionsChange,
      icon: TargetIcon,
      description: 'Across all campaigns',
      iconColor: '#8b5cf6',
      iconBg: '#ede9fe',
    },
    {
      title: 'Avg CTR',
      value: formatPercent(metrics.avgCtr),
      change: metrics.ctrChange,
      icon: ClickIcon,
      description: 'Click-through rate',
      iconColor: '#f59e0b',
      iconBg: '#fef3c7',
    },
  ];

  if (isLoading) {
    return (
      <Box display="flex" gap={3}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} flex={1}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                  <CircularProgress />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box display="flex" gap={3} flexWrap="wrap">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Box key={index} flex="1 1 calc(25% - 18px)" minWidth={250}>
            <Card
              sx={{
                height: '100%',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: card.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color: card.iconColor, fontSize: 20 }} />
                  </Box>
                </Box>
                <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                  {renderChangeIndicator(card.change)}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
}
