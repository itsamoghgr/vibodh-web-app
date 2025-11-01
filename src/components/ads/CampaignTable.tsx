'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Collapse,
} from '@mui/material';
import {
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowRight as ChevronRightIcon,
  UnfoldMore as SortIcon,
  Launch as ExternalLinkIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';

interface CampaignTableProps {
  orgId: string;
  platform: 'all' | 'google_ads' | 'meta_ads';
  timeRange: number;
  refreshKey?: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: 'google_ads' | 'meta_ads';
  status: 'active' | 'paused' | 'ended';
  spend: number;
  roas: number;
  ctr: number;
  conversions: number;
  budget: number;
  performance: 'high' | 'medium' | 'low';
  adSets?: AdSet[];
}

interface AdSet {
  id: string;
  name: string;
  spend: number;
  roas: number;
  ctr: number;
  conversions: number;
  status: 'active' | 'paused';
  ads?: Ad[];
}

interface Ad {
  id: string;
  name: string;
  spend: number;
  roas: number;
  ctr: number;
  conversions: number;
  status: 'active' | 'paused';
}

type SortField = 'name' | 'spend' | 'roas' | 'ctr' | 'conversions';
type SortDirection = 'asc' | 'desc';

export default function CampaignTable({
  orgId,
  platform,
  timeRange,
  refreshKey = 0
}: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedAdSets, setExpandedAdSets] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [orgId, platform, timeRange, refreshKey]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockCampaigns: Campaign[] = generateMockCampaigns(platform);
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockCampaigns = (platformFilter: string): Campaign[] => {
    const campaigns: Campaign[] = [];
    const count = platformFilter === 'all' ? 12 : 6;

    for (let i = 0; i < count; i++) {
      const platformType = platformFilter === 'all'
        ? (i % 2 === 0 ? 'google_ads' : 'meta_ads')
        : platformFilter as 'google_ads' | 'meta_ads';

      const spend = Math.random() * 5000 + 1000;
      const roas = Math.random() * 3 + 1.5;
      const ctr = Math.random() * 3 + 1;
      const conversions = Math.floor(Math.random() * 100 + 20);

      const performance = roas > 3.5 ? 'high' : roas > 2.5 ? 'medium' : 'low';

      campaigns.push({
        id: `campaign-${i}`,
        name: `${platformType === 'google_ads' ? 'Google' : 'Meta'} Campaign ${i + 1}`,
        platform: platformType,
        status: i % 5 === 0 ? 'paused' : i % 7 === 0 ? 'ended' : 'active',
        spend,
        roas,
        ctr,
        conversions,
        budget: spend * 1.2,
        performance,
        adSets: generateMockAdSets(3),
      });
    }

    return campaigns;
  };

  const generateMockAdSets = (count: number): AdSet[] => {
    const adSets: AdSet[] = [];

    for (let i = 0; i < count; i++) {
      adSets.push({
        id: `adset-${i}`,
        name: `Ad Set ${i + 1}`,
        spend: Math.random() * 1500 + 300,
        roas: Math.random() * 3 + 1.5,
        ctr: Math.random() * 3 + 1,
        conversions: Math.floor(Math.random() * 30 + 5),
        status: i % 3 === 0 ? 'paused' : 'active',
        ads: generateMockAds(4),
      });
    }

    return adSets;
  };

  const generateMockAds = (count: number): Ad[] => {
    const ads: Ad[] = [];

    for (let i = 0; i < count; i++) {
      ads.push({
        id: `ad-${i}`,
        name: `Ad ${i + 1}`,
        spend: Math.random() * 400 + 50,
        roas: Math.random() * 3 + 1.5,
        ctr: Math.random() * 3 + 1,
        conversions: Math.floor(Math.random() * 10 + 1),
        status: i % 4 === 0 ? 'paused' : 'active',
      });
    }

    return ads;
  };

  const toggleCampaignExpand = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
      const newExpandedAdSets = new Set(expandedAdSets);
      const campaign = campaigns.find(c => c.id === campaignId);
      campaign?.adSets?.forEach(adSet => newExpandedAdSets.delete(adSet.id));
      setExpandedAdSets(newExpandedAdSets);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const toggleAdSetExpand = (adSetId: string) => {
    const newExpanded = new Set(expandedAdSets);
    if (newExpanded.has(adSetId)) {
      newExpanded.delete(adSetId);
    } else {
      newExpanded.add(adSetId);
    }
    setExpandedAdSets(newExpanded);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedCampaigns = (): Campaign[] => {
    let filtered = [...campaigns];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (performanceFilter !== 'all') {
      filtered = filtered.filter(c => c.performance === performanceFilter);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return filtered;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const renderStatusChip = (status: string) => {
    const colors: Record<string, 'success' | 'default' | 'error'> = {
      active: 'success',
      paused: 'default',
      ended: 'error',
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colors[status]}
        size="small"
      />
    );
  };

  const renderPerformanceChip = (performance: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      high: 'success',
      medium: 'warning',
      low: 'error',
    };

    const icons: Record<string, any> = {
      high: TrendingUp,
      medium: Warning,
      low: TrendingDown,
    };

    const Icon = icons[performance];

    return (
      <Chip
        icon={<Icon />}
        label={performance.charAt(0).toUpperCase() + performance.slice(1)}
        color={colors[performance]}
        size="small"
      />
    );
  };

  const renderPlatformChip = (platform: string) => {
    const colors: Record<string, string> = {
      google_ads: '#4285F4',
      meta_ads: '#1877F2',
    };

    const labels: Record<string, string> = {
      google_ads: 'Google',
      meta_ads: 'Meta',
    };

    return (
      <Chip
        label={labels[platform]}
        size="small"
        sx={{ bgcolor: colors[platform], color: 'white' }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box p={4}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const sortedCampaigns = getSortedCampaigns();

  return (
    <Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={3} p={2}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="ended">Ended</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Performance</InputLabel>
          <Select
            value={performanceFilter}
            label="Performance"
            onChange={(e) => setPerformanceFilter(e.target.value)}
          >
            <MenuItem value="all">All Performance</MenuItem>
            <MenuItem value="high">High Performers</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Needs Attention</MenuItem>
          </Select>
        </FormControl>

        <Box flex={1} />

        <Typography variant="body2" color="text.secondary" alignSelf="center">
          Showing {sortedCampaigns.length} campaign{sortedCampaigns.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell width={50}></TableCell>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  Campaign <SortIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell onClick={() => handleSort('spend')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  Spend <SortIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('roas')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  ROAS <SortIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('ctr')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  CTR <SortIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell onClick={() => handleSort('conversions')} sx={{ cursor: 'pointer' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  Conversions <SortIcon fontSize="small" />
                </Box>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCampaigns.map((campaign) => (
              <React.Fragment key={campaign.id}>
                {/* Campaign Row */}
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleCampaignExpand(campaign.id)}
                    >
                      {expandedCampaigns.has(campaign.id) ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{campaign.name}</Typography>
                  </TableCell>
                  <TableCell>{renderPlatformChip(campaign.platform)}</TableCell>
                  <TableCell>{renderStatusChip(campaign.status)}</TableCell>
                  <TableCell>{renderPerformanceChip(campaign.performance)}</TableCell>
                  <TableCell>{formatCurrency(campaign.spend)}</TableCell>
                  <TableCell>{campaign.roas.toFixed(2)}x</TableCell>
                  <TableCell>{formatPercent(campaign.ctr)}</TableCell>
                  <TableCell>{campaign.conversions}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <ExternalLinkIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      {campaign.status === 'active' ? (
                        <PauseIcon fontSize="small" />
                      ) : (
                        <PlayIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* Ad Sets (Level 2) */}
                {expandedCampaigns.has(campaign.id) && campaign.adSets?.map((adSet) => (
                  <>
                    <TableRow key={adSet.id} sx={{ bgcolor: 'blue.50' }}>
                      <TableCell sx={{ pl: 4 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleAdSetExpand(adSet.id)}
                        >
                          {expandedAdSets.has(adSet.id) ? (
                            <ChevronDownIcon />
                          ) : (
                            <ChevronRightIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          ↳ {adSet.name}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>{renderStatusChip(adSet.status)}</TableCell>
                      <TableCell></TableCell>
                      <TableCell><Typography variant="body2">{formatCurrency(adSet.spend)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{adSet.roas.toFixed(2)}x</Typography></TableCell>
                      <TableCell><Typography variant="body2">{formatPercent(adSet.ctr)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{adSet.conversions}</Typography></TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    {/* Individual Ads (Level 3) */}
                    {expandedAdSets.has(adSet.id) && adSet.ads?.map((ad) => (
                      <TableRow key={ad.id} sx={{ bgcolor: 'purple.50' }}>
                        <TableCell sx={{ pl: 8 }}></TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            ↳↳ {ad.name}
                          </Typography>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <Chip
                            label={ad.status}
                            size="small"
                            color={ad.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell><Typography variant="body2">{formatCurrency(ad.spend)}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{ad.roas.toFixed(2)}x</Typography></TableCell>
                        <TableCell><Typography variant="body2">{formatPercent(ad.ctr)}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{ad.conversions}</Typography></TableCell>
                        <TableCell align="right">
                          <Chip label="View" size="small" clickable />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {sortedCampaigns.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            No campaigns found matching the selected filters.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
