export type SwotType = 'initial' | 'quarterly' | 'ad-hoc';
export type SwotStatus = 'draft' | 'in-progress' | 'final' | 'archived';
export type SwotCategory = 'strength' | 'weakness' | 'opportunity' | 'threat';
export type ItemStatus = 'active' | 'resolved' | 'archived' | 'carried-forward';
export type ActionType = 'leverage' | 'improve' | 'pursue' | 'mitigate' | 'monitor';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'deferred';
export type CollaboratorRole = 'owner' | 'editor' | 'contributor' | 'viewer';
export type BusinessStage = 'startup' | 'growth' | 'mature' | 'turnaround';
export type HistoryActionType = 'created' | 'updated' | 'deleted' | 'status_changed' | 'finalized' | 'carried_forward';

// Main SWOT Analysis interface
export interface SwotAnalysis {
  id: string;
  business_id: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  type: SwotType;
  status: SwotStatus;
  title?: string;
  description?: string;
  swot_score?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  finalized_at?: string;
  due_date?: string;
  
  // Joined data (not in table, but often fetched)
  items?: SwotItem[];
  action_items?: SwotActionItem[];
  collaborators?: SwotCollaborator[];
  
  // Computed fields from view
  total_items?: number;
  strengths_count?: number;
  weaknesses_count?: number;
  opportunities_count?: number;
  threats_count?: number;
  action_items_count?: number;
  completed_actions_count?: number;
}

// Individual SWOT item
export interface SwotItem {
  id: string;
  swot_analysis_id: string;
  category: SwotCategory;
  title: string;
  description?: string;
  impact_level: 1 | 2 | 3 | 4 | 5;
  likelihood?: 1 | 2 | 3 | 4 | 5; // For opportunities and threats
  priority_order: number;
  status: ItemStatus;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  carried_from_item_id?: string;
  
  // Joined data
  comments?: SwotComment[];
  action_items?: SwotActionItem[];
}

// SWOT Comparison between quarters
export interface SwotComparison {
  id: string;
  from_analysis_id: string;
  to_analysis_id: string;
  comparison_date: string;
  items_added: number;
  items_removed: number;
  items_modified: number;
  items_carried_forward: number;
  strengths_change: number;
  weaknesses_change: number;
  opportunities_change: number;
  threats_change: number;
  overall_improvement_score?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  
  // Joined data
  from_analysis?: SwotAnalysis;
  to_analysis?: SwotAnalysis;
}

// Action item derived from SWOT
export interface SwotActionItem {
  id: string;
  swot_item_id: string;
  swot_analysis_id: string;
  title: string;
  description?: string;
  action_type?: ActionType;
  priority: Priority;
  status: ActionStatus;
  assigned_to?: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  due_date?: string;
  completed_date?: string;
  progress_percentage: number;
  effort_hours?: number;
  notes?: string;
  last_update?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  swot_item?: SwotItem;
}

// SWOT Template for prompts
export interface SwotTemplate {
  id: string;
  name: string;
  industry?: string;
  business_stage?: BusinessStage;
  category: SwotCategory;
  prompt_text: string;
  example_items?: string[];
  is_active: boolean;
  created_at: string;
}

// Collaborator on SWOT analysis
export interface SwotCollaborator {
  id: string;
  swot_analysis_id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  role: CollaboratorRole;
  invited_at: string;
  last_accessed?: string;
}

// Comment on SWOT item
export interface SwotComment {
  id: string;
  swot_item_id: string;
  parent_comment_id?: string;
  comment_text: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  
  // Nested replies
  replies?: SwotComment[];
}

// History/audit trail entry
export interface SwotHistory {
  id: string;
  swot_analysis_id?: string;
  swot_item_id?: string;
  action_type: HistoryActionType;
  old_value?: any;
  new_value?: any;
  change_description?: string;
  changed_by: string;
  changed_by_name?: string;
  changed_at: string;
}

// Form data types for creating/updating
export interface CreateSwotAnalysisInput {
  business_id: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  type: SwotType;
  title?: string;
  description?: string;
  due_date?: string;
}

export interface UpdateSwotAnalysisInput {
  title?: string;
  description?: string;
  status?: SwotStatus;
  swot_score?: number;
  due_date?: string;
}

export interface CreateSwotItemInput {
  swot_analysis_id: string;
  category: SwotCategory;
  title: string;
  description?: string;
  impact_level?: 1 | 2 | 3 | 4 | 5;
  likelihood?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface UpdateSwotItemInput {
  title?: string;
  description?: string;
  impact_level?: 1 | 2 | 3 | 4 | 5;
  likelihood?: 1 | 2 | 3 | 4 | 5;
  priority_order?: number;
  status?: ItemStatus;
  tags?: string[];
}

export interface CreateActionItemInput {
  swot_item_id: string;
  swot_analysis_id: string;
  title: string;
  description?: string;
  action_type?: ActionType;
  priority?: Priority;
  assigned_to?: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  due_date?: string;
}

export interface UpdateActionItemInput {
  title?: string;
  description?: string;
  action_type?: ActionType;
  priority?: Priority;
  status?: ActionStatus;
  assigned_to?: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  due_date?: string;
  progress_percentage?: number;
  effort_hours?: number;
  notes?: string;
  last_update?: string;
}

// Utility types for UI state
export interface SwotFilters {
  quarter?: 1 | 2 | 3 | 4;
  year?: number;
  type?: SwotType;
  status?: SwotStatus;
  category?: SwotCategory;
  search?: string;
}

export interface SwotSortOptions {
  field: 'created_at' | 'updated_at' | 'priority_order' | 'impact_level' | 'likelihood';
  direction: 'asc' | 'desc';
}

export interface SwotGridData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface QuarterInfo {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

// Response types for API calls
export interface SwotAnalysisResponse {
  data: SwotAnalysis | null;
  error: Error | null;
}

export interface SwotAnalysisListResponse {
  data: SwotAnalysis[] | null;
  error: Error | null;
  count?: number;
}

export interface SwotItemResponse {
  data: SwotItem | null;
  error: Error | null;
}

export interface SwotActionItemResponse {
  data: SwotActionItem | null;
  error: Error | null;
}

// Statistics and metrics
export interface SwotStatistics {
  totalAnalyses: number;
  completedThisQuarter: number;
  averageSwotScore: number;
  totalActionItems: number;
  completedActionItems: number;
  activeStrengths: number;
  activeWeaknesses: number;
  activeOpportunities: number;
  activeThreats: number;
  trendsOverTime: {
    quarter: string;
    strengths: number;
    weaknesses: number;
    opportunities: number;
    threats: number;
    score: number;
  }[];
}

// Export data structure
export interface SwotExportData {
  analysis: SwotAnalysis;
  items: SwotGridData;
  actionItems: SwotActionItem[];
  comparison?: SwotComparison;
  statistics?: SwotStatistics;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'json';
}

// Helper function to get current quarter
export function getCurrentQuarter(): QuarterInfo {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  let quarter: 1 | 2 | 3 | 4;
  if (month < 3) quarter = 1;
  else if (month < 6) quarter = 2;
  else if (month < 9) quarter = 3;
  else quarter = 4;
  
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  
  return {
    quarter,
    year,
    label: `Q${quarter} ${year}`,
    startDate: new Date(year, startMonth, 1),
    endDate: new Date(year, endMonth + 1, 0),
    isCurrent: true,
    isPast: false,
    isFuture: false
  };
}

// Helper function to get quarter from date
export function getQuarterFromDate(date: Date): QuarterInfo {
  const month = date.getMonth();
  const year = date.getFullYear();
  const now = new Date();
  
  let quarter: 1 | 2 | 3 | 4;
  if (month < 3) quarter = 1;
  else if (month < 6) quarter = 2;
  else if (month < 9) quarter = 3;
  else quarter = 4;
  
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0);
  
  return {
    quarter,
    year,
    label: `Q${quarter} ${year}`,
    startDate,
    endDate,
    isCurrent: now >= startDate && now <= endDate,
    isPast: endDate < now,
    isFuture: startDate > now
  };
}

// Helper to format quarter display
export function formatQuarter(quarter: number, year: number): string {
  return `Q${quarter} ${year}`;
}

// Helper to get color for SWOT category
export function getCategoryColor(category: SwotCategory): string {
  switch (category) {
    case 'strength':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'weakness':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'opportunity':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'threat':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Helper to get icon for SWOT category
export function getCategoryIcon(category: SwotCategory): string {
  switch (category) {
    case 'strength':
      return '💪';
    case 'weakness':
      return '⚠️';
    case 'opportunity':
      return '🎯';
    case 'threat':
      return '🔥';
    default:
      return '📊';
  }
}

// Type guards
export function isSwotAnalysis(obj: any): obj is SwotAnalysis {
  return obj && typeof obj.id === 'string' && typeof obj.business_id === 'string';
}

export function isSwotItem(obj: any): obj is SwotItem {
  return obj && typeof obj.id === 'string' && typeof obj.swot_analysis_id === 'string';
}