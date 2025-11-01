'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Network,
  RefreshCw,
  Maximize2,
  Filter,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';

interface CampaignKnowledgeGraphProps {
  orgId: string;
  campaignId?: string;
  refreshKey?: number;
}

interface GraphNode {
  id: string;
  name: string;
  type: 'ad_campaign' | 'ad_platform' | 'optimization_action' | 'topic';
  metadata?: any;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphInsight {
  type: 'optimization_pattern' | 'platform_preference' | 'performance_trend';
  message: string;
  confidence: number;
  metadata?: any;
}

export default function CampaignKnowledgeGraph({
  orgId,
  campaignId,
  refreshKey = 0
}: CampaignKnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [insights, setInsights] = useState<GraphInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'full' | 'campaign' | 'optimizations'>('full');

  useEffect(() => {
    fetchGraphData();
  }, [orgId, campaignId, refreshKey]);

  const fetchGraphData = async () => {
    try {
      setIsLoading(true);

      if (campaignId) {
        // Fetch specific campaign graph
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/v1/cil/ads/kg/campaign-graph/${campaignId}`);
        // const data = await response.json();
      } else {
        // Fetch org-level ads insights
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/v1/cil/ads/kg/insights/${orgId}`);
        // const data = await response.json();
      }

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData: GraphData = generateMockGraphData();
      const mockInsights: GraphInsight[] = generateMockInsights();

      setGraphData(mockData);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockGraphData = (): GraphData => {
    const nodes: GraphNode[] = [
      {
        id: 'campaign-1',
        name: 'Holiday Sale Campaign',
        type: 'ad_campaign',
        metadata: { platform: 'google_ads', status: 'active' }
      },
      {
        id: 'campaign-2',
        name: 'Brand Awareness Q1',
        type: 'ad_campaign',
        metadata: { platform: 'meta_ads', status: 'active' }
      },
      {
        id: 'platform-google',
        name: 'Google Ads',
        type: 'ad_platform',
      },
      {
        id: 'platform-meta',
        name: 'Meta Ads',
        type: 'ad_platform',
      },
      {
        id: 'opt-1',
        name: 'Budget Increase +15%',
        type: 'optimization_action',
        metadata: { success: true, gain: 22.5 }
      },
      {
        id: 'opt-2',
        name: 'Bid Strategy: Target ROAS',
        type: 'optimization_action',
        metadata: { success: true, gain: 18.3 }
      },
      {
        id: 'metric-roas-1',
        name: 'ROAS: 4.2x',
        type: 'topic',
        metadata: { metric_type: 'roas', value: 4.2 }
      },
      {
        id: 'metric-roas-2',
        name: 'ROAS: 3.8x',
        type: 'topic',
        metadata: { metric_type: 'roas', value: 3.8 }
      },
    ];

    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        from: 'campaign-1',
        to: 'platform-google',
        relation: 'runs_on',
        confidence: 1.0
      },
      {
        id: 'edge-2',
        from: 'campaign-2',
        to: 'platform-meta',
        relation: 'runs_on',
        confidence: 1.0
      },
      {
        id: 'edge-3',
        from: 'campaign-1',
        to: 'opt-1',
        relation: 'optimized_by',
        confidence: 0.92
      },
      {
        id: 'edge-4',
        from: 'campaign-2',
        to: 'opt-2',
        relation: 'optimized_by',
        confidence: 0.88
      },
      {
        id: 'edge-5',
        from: 'campaign-1',
        to: 'metric-roas-1',
        relation: 'achieved_performance',
        confidence: 0.95
      },
      {
        id: 'edge-6',
        from: 'campaign-2',
        to: 'metric-roas-2',
        relation: 'achieved_performance',
        confidence: 0.95
      },
    ];

    return { nodes, edges };
  };

  const generateMockInsights = (): GraphInsight[] => {
    return [
      {
        type: 'optimization_pattern',
        message: 'Budget adjustment optimizations have been successful 3 times',
        confidence: 0.85,
        metadata: { action: 'budget_adjustment', count: 3 }
      },
      {
        type: 'platform_preference',
        message: 'Google Ads consistently outperforms Meta Ads by 1.2x ROAS',
        confidence: 0.82,
        metadata: { roas_diff: 1.2 }
      },
    ];
  };

  const filteredNodes = useMemo(() => {
    if (viewMode === 'full') return graphData.nodes;

    if (viewMode === 'campaign') {
      return graphData.nodes.filter(n =>
        n.type === 'ad_campaign' || n.type === 'ad_platform'
      );
    }

    if (viewMode === 'optimizations') {
      return graphData.nodes.filter(n =>
        n.type === 'ad_campaign' || n.type === 'optimization_action'
      );
    }

    return graphData.nodes;
  }, [graphData, viewMode]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return graphData.edges.filter(e =>
      nodeIds.has(e.from) && nodeIds.has(e.to)
    );
  }, [graphData.edges, filteredNodes]);

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      ad_campaign: '#3b82f6',
      ad_platform: '#8b5cf6',
      optimization_action: '#10b981',
      topic: '#f59e0b',
    };
    return colors[type] || '#6b7280';
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, any> = {
      ad_campaign: Target,
      ad_platform: Network,
      optimization_action: Zap,
      topic: TrendingUp,
    };
    return icons[type] || Network;
  };

  const getInsightBadgeStyle = (type: string) => {
    const styles: Record<string, string> = {
      optimization_pattern: 'bg-green-100 text-green-800 border-green-200',
      platform_preference: 'bg-blue-100 text-blue-800 border-blue-200',
      performance_trend: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return styles[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Typography variant="h6">Campaign Knowledge Graph</Typography>
        </CardHeader>
        <CardContent>
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">Loading knowledge graph...</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Network style={{ height: 20, width: 20 }} />
              <Typography variant="h6">Campaign Knowledge Graph</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Visualizing relationships between campaigns, platforms, and optimizations
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                startAdornment={<Filter style={{ height: 16, width: 16, marginRight: 8 }} />}
              >
                <MenuItem value="full">Full Graph</MenuItem>
                <MenuItem value="campaign">Campaigns & Platforms</MenuItem>
                <MenuItem value="optimizations">Optimizations</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={fetchGraphData}>
              <RefreshCw style={{ height: 16, width: 16 }} />
            </Button>
          </Box>
        </Box>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Discovered Insights</h3>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{insight.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        label={insight.type.replace('_', ' ')}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graph Visualization (Simplified) */}
        <div className="border rounded-lg p-6 bg-gray-50 min-h-[400px]">
          <div className="grid grid-cols-3 gap-6">
            {/* Campaigns Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Campaigns
              </h4>
              {filteredNodes
                .filter(n => n.type === 'ad_campaign')
                .map(node => {
                  const Icon = getNodeIcon(node.type);
                  return (
                    <div
                      key={node.id}
                      className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{ borderLeftWidth: '3px', borderLeftColor: getNodeColor(node.type) }}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5" style={{ color: getNodeColor(node.type) }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{node.name}</p>
                          {node.metadata?.platform && (
                            <Chip
                              label={node.metadata.platform.replace('_', ' ')}
                              variant="outlined"
                              size="small"
                              sx={{ mt: 0.5, fontSize: '0.75rem', textTransform: 'capitalize' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Optimizations Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Optimizations
              </h4>
              {filteredNodes
                .filter(n => n.type === 'optimization_action')
                .map(node => {
                  const Icon = getNodeIcon(node.type);
                  return (
                    <div
                      key={node.id}
                      className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{ borderLeftWidth: '3px', borderLeftColor: getNodeColor(node.type) }}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5" style={{ color: getNodeColor(node.type) }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{node.name}</p>
                          {node.metadata?.gain && (
                            <p className="text-xs text-green-600 mt-1">
                              +{node.metadata.gain.toFixed(1)}% gain
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Performance Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                Performance
              </h4>
              {filteredNodes
                .filter(n => n.type === 'topic')
                .map(node => {
                  const Icon = getNodeIcon(node.type);
                  return (
                    <div
                      key={node.id}
                      className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{ borderLeftWidth: '3px', borderLeftColor: getNodeColor(node.type) }}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5" style={{ color: getNodeColor(node.type) }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{node.name}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Graph Stats */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{filteredNodes.length} entities</span>
              <span>{filteredEdges.length} relationships</span>
            </div>
            <Button variant="text" size="small">
              <Maximize2 style={{ height: 16, width: 16, marginRight: 8 }} />
              Full View
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-muted-foreground">Legend:</span>
          {['ad_campaign', 'optimization_action', 'ad_platform', 'topic'].map(type => {
            const Icon = getNodeIcon(type);
            return (
              <div key={type} className="flex items-center gap-1">
                <Icon className="h-3 w-3" style={{ color: getNodeColor(type) }} />
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
