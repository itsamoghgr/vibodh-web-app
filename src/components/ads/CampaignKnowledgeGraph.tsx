'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Network,
  RefreshCw,
  Maximize2,
  Filter,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          <CardTitle>Campaign Knowledge Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading knowledge graph...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Campaign Knowledge Graph
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualizing relationships between campaigns, platforms, and optimizations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Graph</SelectItem>
                <SelectItem value="campaign">Campaigns & Platforms</SelectItem>
                <SelectItem value="optimizations">Optimizations</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchGraphData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
                      <Badge className={getInsightBadgeStyle(insight.type)}>
                        {insight.type.replace('_', ' ')}
                      </Badge>
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
                            <Badge variant="outline" className="mt-1 text-xs">
                              {node.metadata.platform.replace('_', ' ')}
                            </Badge>
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
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4 mr-2" />
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
