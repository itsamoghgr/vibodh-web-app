'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material'
import {
  Chat as SlackIcon,
  Description as NotionIcon,
  Cloud as DriveIcon,
  BugReport as JiraIcon,
  Campaign as GoogleAdsIcon,
  Paid as MetaAdsIcon,
  CheckCircle,
  Schedule,
  Error,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material'

const sourceIcons: Record<string, any> = {
  slack: SlackIcon,
  notion: NotionIcon,
  drive: DriveIcon,
  jira: JiraIcon,
  google_ads: GoogleAdsIcon,
  meta_ads: MetaAdsIcon,
}

const statusColors: Record<string, 'success' | 'warning' | 'error'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
}

const statusIcons: Record<string, any> = {
  completed: CheckCircle,
  pending: Schedule,
  failed: Error,
}

interface Document {
  id: string
  source_type: string
  title: string
  content: string
  summary?: string
  author?: string
  channel_name?: string
  channel_id?: string
  embedding_status: string
  created_at: string
  url?: string
  metadata?: any
}

interface DocumentsTableProps {
  documents: Document[]
}

function DocumentRow({ doc }: { doc: Document }) {
  const [open, setOpen] = useState(false)
  const SourceIcon = sourceIcons[doc.source_type]
  const StatusIcon = statusIcons[doc.embedding_status]
  const statusColor = statusColors[doc.embedding_status]

  // Check if this is an ads campaign
  const isAdsCampaign = doc.source_type === 'google_ads' || doc.source_type === 'meta_ads'

  // Extract campaign-specific data from metadata
  const campaignObjective = isAdsCampaign ? doc.metadata?.objective : null
  const campaignStatus = isAdsCampaign ? doc.metadata?.status : null

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {SourceIcon && <SourceIcon fontSize="small" />}
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
              {doc.source_type.replace('_', ' ')}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {doc.title || doc.content?.substring(0, 50) + '...'}
          </Typography>
        </TableCell>
        <TableCell>
          {isAdsCampaign ? (
            <Chip
              label={campaignObjective || 'Campaign'}
              size="small"
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          ) : (
            <Typography variant="body2">{doc.author || 'Unknown'}</Typography>
          )}
        </TableCell>
        <TableCell>
          {isAdsCampaign ? (
            <Chip
              label={campaignStatus || 'unknown'}
              size="small"
              color={
                campaignStatus === 'active' ? 'success' :
                campaignStatus === 'paused' ? 'warning' :
                campaignStatus === 'deleted' ? 'error' : 'default'
              }
              sx={{ textTransform: 'capitalize' }}
            />
          ) : (
            <Typography variant="body2">
              {doc.channel_name || doc.channel_id || '-'}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Chip
            icon={StatusIcon && <StatusIcon />}
            label={doc.embedding_status}
            color={statusColor}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(doc.created_at).toLocaleDateString()}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 3, px: 2 }}>
              {doc.summary && isAdsCampaign && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Summary
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {doc.summary}
                  </Typography>
                </Box>
              )}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {isAdsCampaign ? 'Campaign Details' : 'Document Content'}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: isAdsCampaign ? 'inherit' : 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  {doc.content}
                </Typography>
              </Paper>
              {doc.url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source URL:{' '}
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.url}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 50 }} />
            <TableCell>Source</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
