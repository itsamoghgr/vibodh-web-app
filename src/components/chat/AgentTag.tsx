'use client';

import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  Psychology as BrainIcon,
  Hub as GraphIcon,
  Memory as MemoryIcon,
  Lightbulb as InsightIcon,
  Campaign as MarketingIcon,
} from '@mui/icons-material';
import { AgentCapability, AgentType, AgentTagProps } from '@/types/chat';

export default function AgentTag({ capabilities, agentType, size = 'small' }: AgentTagProps) {
  const getCapabilityIcon = (capability: AgentCapability) => {
    const iconSize = size === 'small' ? 'inherit' : 'small';
    switch (capability) {
      case 'RAG':
        return <BrainIcon fontSize={iconSize} />;
      case 'KG':
        return <GraphIcon fontSize={iconSize} />;
      case 'Memory':
        return <MemoryIcon fontSize={iconSize} />;
      case 'Insight':
        return <InsightIcon fontSize={iconSize} />;
      case 'Marketing':
        return <MarketingIcon fontSize={iconSize} />;
    }
  };

  const getCapabilityLabel = (capability: AgentCapability) => {
    switch (capability) {
      case 'RAG':
        return 'RAG';
      case 'KG':
        return 'KG';
      case 'Memory':
        return 'Memory';
      case 'Insight':
        return 'Insight';
      case 'Marketing':
        return 'Marketing';
    }
  };

  const getCapabilityDescription = (capability: AgentCapability) => {
    switch (capability) {
      case 'RAG':
        return 'Retrieval-Augmented Generation - Using knowledge base and documents';
      case 'KG':
        return 'Knowledge Graph - Leveraging structured knowledge connections';
      case 'Memory':
        return 'Conversation Memory - Remembering context from previous messages';
      case 'Insight':
        return 'Data Insights - Analyzing patterns and generating insights';
      case 'Marketing':
        return 'Marketing Campaign - Planning and executing marketing actions';
    }
  };

  const getAgentTypeLabel = (type: AgentType) => {
    switch (type) {
      case 'communication_agent':
        return 'Communication Agent';
      case 'marketing_agent':
        return 'Marketing Agent';
      case 'ops_agent':
        return 'Operations Agent';
      case 'data_agent':
        return 'Data Agent';
      case 'insight_agent':
        return 'Insight Agent';
    }
  };

  if (!capabilities || capabilities.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
      {agentType && (
        <Tooltip title={getAgentTypeLabel(agentType)}>
          <Chip
            label={getAgentTypeLabel(agentType).replace(' Agent', '')}
            size={size === 'large' ? 'medium' : size}
            color="default"
            variant="outlined"
            sx={{ height: size === 'small' ? 20 : 24, fontSize: size === 'small' ? 10 : 12 }}
          />
        </Tooltip>
      )}
      {capabilities.map((capability) => (
        <Tooltip key={capability} title={getCapabilityDescription(capability)} arrow>
          <Chip
            icon={getCapabilityIcon(capability)}
            label={getCapabilityLabel(capability)}
            size={size === 'large' ? 'medium' : size}
            color="primary"
            variant="outlined"
            sx={{
              height: size === 'small' ? 20 : 24,
              fontSize: size === 'small' ? 10 : 12,
              '& .MuiChip-icon': {
                fontSize: size === 'small' ? 12 : 16,
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}
