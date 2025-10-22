'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  Alert,
  Button,
} from '@mui/material';
import {
  CalendarToday,
  TrendingUp,
  Refresh,
  Warning,
} from '@mui/icons-material';
import AdsSummaryCards from '@/components/ads/AdsSummaryCards';
import AdsTrendsChart from '@/components/ads/AdsTrendsChart';
import CampaignTable from '@/components/ads/CampaignTable';
import PlatformComparison from '@/components/ads/PlatformComparison';

type TimeRange = '7' | '30' | '90';
type Platform = 'all' | 'google_ads' | 'meta_ads';

export default function AdsAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock org_id - in production, get from auth context
  const orgId = 'mock-org-id';

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Ads Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Monitor and optimize your advertising performance across platforms
            </Typography>
          </Box>

          <Box display="flex" gap={2} alignItems="center">
            {/* Time Range Selector */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                startAdornment={<CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
              </Select>
            </FormControl>

            {/* Platform Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={selectedPlatform}
                label="Platform"
                onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="google_ads">Google Ads</MenuItem>
                <MenuItem value="meta_ads">Meta Ads</MenuItem>
              </Select>
            </FormControl>

            {/* Refresh Button */}
            <IconButton
              onClick={handleRefresh}
              disabled={isLoading}
              color="primary"
            >
              <Refresh className={isLoading ? 'animate-spin' : ''} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <AdsSummaryCards
          orgId={orgId}
          timeRange={parseInt(timeRange)}
          platform={selectedPlatform}
          refreshKey={refreshKey}
        />
      </Box>

      {/* Platform Comparison */}
      {selectedPlatform === 'all' && (
        <Box sx={{ mb: 4 }}>
          <PlatformComparison
            orgId={orgId}
            timeRange={parseInt(timeRange)}
            refreshKey={refreshKey}
          />
        </Box>
      )}

      {/* Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Performance Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Daily metrics over time
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Daily metrics
              </Typography>
            </Box>
          </Box>
          <AdsTrendsChart
            orgId={orgId}
            timeRange={parseInt(timeRange)}
            platform={selectedPlatform}
            refreshKey={refreshKey}
          />
        </CardContent>
      </Card>

      {/* Campaign Table */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Campaigns
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Detailed view of all advertising campaigns
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {selectedPlatform === 'all' ? 'All Platforms' :
               selectedPlatform === 'google_ads' ? 'Google Ads' : 'Meta Ads'}
            </Typography>
          </Box>
        </Box>
        <CampaignTable
          orgId={orgId}
          platform={selectedPlatform}
          timeRange={parseInt(timeRange)}
          refreshKey={refreshKey}
        />
      </Card>

      {/* Alerts Banner */}
      <Alert
        severity="warning"
        icon={<Warning />}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              // Navigate to alerts page
              window.location.href = '/dashboard/ads-alerts';
            }}
          >
            View all alerts →
          </Button>
        }
      >
        <Typography variant="body2" fontWeight={600}>
          Performance Alerts
        </Typography>
        <Typography variant="body2">
          2 campaigns need attention • 1 budget overage detected
        </Typography>
      </Alert>
    </Box>
  );
}
