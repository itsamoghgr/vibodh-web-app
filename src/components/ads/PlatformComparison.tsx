'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  Warning,
} from '@mui/icons-material';

interface PlatformComparisonProps {
  orgId: string;
  timeRange: number;
  refreshKey?: number;
}

interface PlatformMetrics {
  platform: string;
  spend: number;
  roas: number;
  conversions: number;
  ctr: number;
  campaignCount: number;
}

interface ComparisonInsight {
  type: 'winner' | 'opportunity' | 'warning';
  metric: string;
  message: string;
  platform: string;
  value: number;
}

export default function PlatformComparison({
  orgId,
  timeRange,
  refreshKey = 0
}: PlatformComparisonProps) {
  const [metrics, setMetrics] = useState<PlatformMetrics[]>([]);
  const [insights, setInsights] = useState<ComparisonInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformMetrics();
  }, [orgId, timeRange, refreshKey]);

  const fetchPlatformMetrics = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockMetrics: PlatformMetrics[] = [
        {
          platform: 'Google Ads',
          spend: 28500,
          roas: 4.2,
          conversions: 742,
          ctr: 2.8,
          campaignCount: 8,
        },
        {
          platform: 'Meta Ads',
          spend: 16750,
          roas: 3.3,
          conversions: 505,
          ctr: 2.1,
          campaignCount: 6,
        },
      ];

      setMetrics(mockMetrics);
      generateInsights(mockMetrics);
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (data: PlatformMetrics[]) => {
    const insights: ComparisonInsight[] = [];

    if (data.length < 2) return;

    const google = data.find(m => m.platform === 'Google Ads');
    const meta = data.find(m => m.platform === 'Meta Ads');

    if (!google || !meta) return;

    const roasDiff = Math.abs(google.roas - meta.roas);
    if (roasDiff > 0.5) {
      const winner = google.roas > meta.roas ? google : meta;
      insights.push({
        type: 'winner',
        metric: 'ROAS',
        message: `${winner.platform} is delivering ${roasDiff.toFixed(1)}x higher ROAS`,
        platform: winner.platform,
        value: winner.roas,
      });
    }

    const ctrDiff = Math.abs(google.ctr - meta.ctr);
    if (ctrDiff > 0.5) {
      const winner = google.ctr > meta.ctr ? google : meta;
      insights.push({
        type: 'opportunity',
        metric: 'CTR',
        message: `${winner.platform} has ${ctrDiff.toFixed(1)}% better CTR`,
        platform: winner.platform,
        value: winner.ctr,
      });
    }

    const googleEfficiency = google.conversions / google.spend;
    const metaEfficiency = meta.conversions / meta.spend;
    const efficiencyDiff = Math.abs(googleEfficiency - metaEfficiency);

    if (efficiencyDiff > 0.01) {
      const inefficient = googleEfficiency < metaEfficiency ? 'Google Ads' : 'Meta Ads';

      insights.push({
        type: 'warning',
        metric: 'Cost per Conversion',
        message: `${inefficient} is less cost-efficient. Consider budget reallocation.`,
        platform: inefficient,
        value: efficiencyDiff * 100,
      });
    }

    setInsights(insights);
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

  const getBarColor = (platform: string) => {
    return platform === 'Google Ads' ? '#4285F4' : '#1877F2';
  };

  const renderInsightIcon = (type: string) => {
    switch (type) {
      case 'winner':
        return <EmojiEvents sx={{ color: 'success.main' }} />;
      case 'opportunity':
        return <TrendingUp sx={{ color: 'info.main' }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      default:
        return <TrendingUp sx={{ color: 'info.main' }} />;
    }
  };

  const getInsightColor = (type: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning'> = {
      winner: 'success',
      opportunity: 'info',
      warning: 'warning',
    };
    return colors[type] || 'default';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const spendData = metrics.map(m => ({ platform: m.platform, value: m.spend }));
  const roasData = metrics.map(m => ({ platform: m.platform, value: m.roas }));
  const conversionsData = metrics.map(m => ({ platform: m.platform, value: m.conversions }));
  const ctrData = metrics.map(m => ({ platform: m.platform, value: m.ctr }));

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Platform Comparison
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Performance comparison across advertising platforms
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              {metrics.map((metric) => (
                <Chip
                  key={metric.platform}
                  label={metric.platform}
                  sx={{
                    bgcolor: getBarColor(metric.platform),
                    color: 'white',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Insights Cards */}
        {insights.length > 0 && (
          <Box display="flex" gap={2} sx={{ mb: 4 }} flexWrap="wrap">
            {insights.map((insight, index) => (
              <Box key={index} flex="1 1 calc(33.33% - 11px)" minWidth={280}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeft: 4,
                    borderLeftColor: `${getInsightColor(insight.type)}.main`,
                    height: '100%',
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {insight.metric}
                      </Typography>
                      <Chip
                        icon={renderInsightIcon(insight.type)}
                        label={insight.type === 'winner' ? 'Best Performer' : insight.type === 'opportunity' ? 'Opportunity' : 'Needs Attention'}
                        color={getInsightColor(insight.type)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {insight.message}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Comparison Charts */}
        <Box display="flex" gap={3} flexWrap="wrap">
          {/* Spend Comparison */}
          <Box flex="1 1 calc(50% - 12px)" minWidth={300}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Total Spend
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {spendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.platform)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* ROAS Comparison */}
          <Box flex="1 1 calc(50% - 12px)" minWidth={300}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Return on Ad Spend (ROAS)
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(1)}x`} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}x`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {roasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.platform)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Conversions Comparison */}
          <Box flex="1 1 calc(50% - 12px)" minWidth={300}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Total Conversions
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {conversionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.platform)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* CTR Comparison */}
          <Box flex="1 1 calc(50% - 12px)" minWidth={300}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Click-Through Rate (CTR)
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {ctrData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.platform)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box display="flex" gap={3} sx={{ pt: 3, mt: 2, borderTop: 1, borderColor: 'divider' }} flexWrap="wrap">
          {metrics.map((metric) => (
            <Box key={metric.platform} flex="1 1 calc(50% - 12px)" minWidth={300}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: getBarColor(metric.platform),
                  }}
                />
                <Typography variant="subtitle2" fontWeight={600}>
                  {metric.platform}
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Campaigns
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metric.campaignCount}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Avg ROAS
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metric.roas.toFixed(2)}x
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    Cost/Conv
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(metric.spend / metric.conversions)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
