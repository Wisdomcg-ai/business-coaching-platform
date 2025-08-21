export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          answers: Json | null
          assessment_type: string | null
          business_id: string | null
          completed_at: string | null
          completed_by: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          disciplines_max: number | null
          disciplines_score: number | null
          engines_max: number | null
          engines_score: number | null
          foundation_max: number | null
          foundation_score: number | null
          health_score: number | null
          health_status: string | null
          id: string
          percentage: number | null
          profitability_max: number | null
          profitability_score: number | null
          revenue_stage: string | null
          status: string | null
          strategic_wheel_max: number | null
          strategic_wheel_score: number | null
          total_max: number | null
          total_score: number | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_type?: string | null
          business_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          disciplines_max?: number | null
          disciplines_score?: number | null
          engines_max?: number | null
          engines_score?: number | null
          foundation_max?: number | null
          foundation_score?: number | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          percentage?: number | null
          profitability_max?: number | null
          profitability_score?: number | null
          revenue_stage?: string | null
          status?: string | null
          strategic_wheel_max?: number | null
          strategic_wheel_score?: number | null
          total_max?: number | null
          total_score?: number | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_type?: string | null
          business_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          disciplines_max?: number | null
          disciplines_score?: number | null
          engines_max?: number | null
          engines_score?: number | null
          foundation_max?: number | null
          foundation_score?: number | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          percentage?: number | null
          profitability_max?: number | null
          profitability_score?: number | null
          revenue_stage?: string | null
          status?: string | null
          strategic_wheel_max?: number | null
          strategic_wheel_score?: number | null
          total_max?: number | null
          total_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_business_id"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments_backup: {
        Row: {
          business_id: string | null
          completed_at: string | null
          completed_by: string | null
          completion_percentage: number | null
          created_at: string | null
          id: string | null
          responses: Json | null
          scores: Json | null
        }
        Insert: {
          business_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string | null
          responses?: Json | null
          scores?: Json | null
        }
        Update: {
          business_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string | null
          responses?: Json | null
          scores?: Json | null
        }
        Relationships: []
      }
      business_members: {
        Row: {
          business_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          abn_tax_id: string | null
          annual_revenue: number | null
          business_id: string | null
          business_model: string | null
          cash_position: number | null
          cash_runway_months: number | null
          coaching_relationship: Json | null
          company_structure: string | null
          completion_percentage: number | null
          contractors: number | null
          created_at: string | null
          customer_intelligence: Json | null
          ebitda: number | null
          financial_metrics: Json | null
          full_time_employees: number | null
          gross_margin: number | null
          gross_profit: number | null
          id: string
          industry_classification: string | null
          last_saved: string | null
          legal_name: string | null
          locations: string[] | null
          monthly_recurring_revenue: number | null
          net_margin: number | null
          net_profit: number | null
          operating_expenses: number | null
          operational_excellence: Json | null
          part_time_employees: number | null
          products_services: Json | null
          regulatory_requirements: string[] | null
          revenue_stage: string | null
          strategic_context: Json | null
          sub_industry: string | null
          team_structure: Json | null
          total_employees: number | null
          trading_name: string | null
          updated_at: string | null
          user_id: string
          working_capital: number | null
          years_in_business: number | null
        }
        Insert: {
          abn_tax_id?: string | null
          annual_revenue?: number | null
          business_id?: string | null
          business_model?: string | null
          cash_position?: number | null
          cash_runway_months?: number | null
          coaching_relationship?: Json | null
          company_structure?: string | null
          completion_percentage?: number | null
          contractors?: number | null
          created_at?: string | null
          customer_intelligence?: Json | null
          ebitda?: number | null
          financial_metrics?: Json | null
          full_time_employees?: number | null
          gross_margin?: number | null
          gross_profit?: number | null
          id?: string
          industry_classification?: string | null
          last_saved?: string | null
          legal_name?: string | null
          locations?: string[] | null
          monthly_recurring_revenue?: number | null
          net_margin?: number | null
          net_profit?: number | null
          operating_expenses?: number | null
          operational_excellence?: Json | null
          part_time_employees?: number | null
          products_services?: Json | null
          regulatory_requirements?: string[] | null
          revenue_stage?: string | null
          strategic_context?: Json | null
          sub_industry?: string | null
          team_structure?: Json | null
          total_employees?: number | null
          trading_name?: string | null
          updated_at?: string | null
          user_id: string
          working_capital?: number | null
          years_in_business?: number | null
        }
        Update: {
          abn_tax_id?: string | null
          annual_revenue?: number | null
          business_id?: string | null
          business_model?: string | null
          cash_position?: number | null
          cash_runway_months?: number | null
          coaching_relationship?: Json | null
          company_structure?: string | null
          completion_percentage?: number | null
          contractors?: number | null
          created_at?: string | null
          customer_intelligence?: Json | null
          ebitda?: number | null
          financial_metrics?: Json | null
          full_time_employees?: number | null
          gross_margin?: number | null
          gross_profit?: number | null
          id?: string
          industry_classification?: string | null
          last_saved?: string | null
          legal_name?: string | null
          locations?: string[] | null
          monthly_recurring_revenue?: number | null
          net_margin?: number | null
          net_profit?: number | null
          operating_expenses?: number | null
          operational_excellence?: Json | null
          part_time_employees?: number | null
          products_services?: Json | null
          regulatory_requirements?: string[] | null
          revenue_stage?: string | null
          strategic_context?: Json | null
          sub_industry?: string | null
          team_structure?: Json | null
          total_employees?: number | null
          trading_name?: string | null
          updated_at?: string | null
          user_id?: string
          working_capital?: number | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          abn_tax_id: string | null
          annual_revenue: number | null
          business_model: string | null
          business_name: string | null
          created_at: string | null
          created_by: string | null
          customer_concentration: number | null
          customer_segments: Json | null
          employee_count: number | null
          gross_margin: number | null
          growth_opportunities: string[] | null
          id: string
          industry: string | null
          key_roles: Json | null
          legal_name: string | null
          locations: string[] | null
          name: string
          net_margin: number | null
          owner_id: string | null
          products_services: Json | null
          profile_completed: boolean | null
          profile_updated_at: string | null
          revenue_growth_rate: number | null
          revenue_stage: string | null
          top_challenges: string[] | null
          total_customers: number | null
          updated_at: string | null
          years_in_business: number | null
        }
        Insert: {
          abn_tax_id?: string | null
          annual_revenue?: number | null
          business_model?: string | null
          business_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_concentration?: number | null
          customer_segments?: Json | null
          employee_count?: number | null
          gross_margin?: number | null
          growth_opportunities?: string[] | null
          id?: string
          industry?: string | null
          key_roles?: Json | null
          legal_name?: string | null
          locations?: string[] | null
          name: string
          net_margin?: number | null
          owner_id?: string | null
          products_services?: Json | null
          profile_completed?: boolean | null
          profile_updated_at?: string | null
          revenue_growth_rate?: number | null
          revenue_stage?: string | null
          top_challenges?: string[] | null
          total_customers?: number | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Update: {
          abn_tax_id?: string | null
          annual_revenue?: number | null
          business_model?: string | null
          business_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_concentration?: number | null
          customer_segments?: Json | null
          employee_count?: number | null
          gross_margin?: number | null
          growth_opportunities?: string[] | null
          id?: string
          industry?: string | null
          key_roles?: Json | null
          legal_name?: string | null
          locations?: string[] | null
          name?: string
          net_margin?: number | null
          owner_id?: string | null
          products_services?: Json | null
          profile_completed?: boolean | null
          profile_updated_at?: string | null
          revenue_growth_rate?: number | null
          revenue_stage?: string | null
          top_challenges?: string[] | null
          total_customers?: number | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      monthly_reviews: {
        Row: {
          actual_cash_position: number | null
          actual_gross_profit: number | null
          actual_gross_profit_percent: number | null
          actual_net_profit: number | null
          actual_net_profit_percent: number | null
          actual_revenue: number | null
          adjustments_made: string | null
          business_id: string | null
          challenges: string | null
          created_at: string | null
          created_by: string | null
          gross_profit_variance: number | null
          id: string
          kpi_actuals: Json | null
          net_profit_variance: number | null
          revenue_variance: number | null
          review_month: string
          wins: string | null
        }
        Insert: {
          actual_cash_position?: number | null
          actual_gross_profit?: number | null
          actual_gross_profit_percent?: number | null
          actual_net_profit?: number | null
          actual_net_profit_percent?: number | null
          actual_revenue?: number | null
          adjustments_made?: string | null
          business_id?: string | null
          challenges?: string | null
          created_at?: string | null
          created_by?: string | null
          gross_profit_variance?: number | null
          id?: string
          kpi_actuals?: Json | null
          net_profit_variance?: number | null
          revenue_variance?: number | null
          review_month: string
          wins?: string | null
        }
        Update: {
          actual_cash_position?: number | null
          actual_gross_profit?: number | null
          actual_gross_profit_percent?: number | null
          actual_net_profit?: number | null
          actual_net_profit_percent?: number | null
          actual_revenue?: number | null
          adjustments_made?: string | null
          business_id?: string | null
          challenges?: string | null
          created_at?: string | null
          created_by?: string | null
          gross_profit_variance?: number | null
          id?: string
          kpi_actuals?: Json | null
          net_profit_variance?: number | null
          revenue_variance?: number | null
          review_month?: string
          wins?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quarterly_forecasts: {
        Row: {
          business_id: string | null
          created_at: string | null
          gross_profit_gap: number | null
          id: string
          is_active: boolean | null
          kpi_gaps: Json | null
          month1_cash: number | null
          month1_gross_profit: number | null
          month1_gross_profit_percent: number | null
          month1_net_profit: number | null
          month1_net_profit_percent: number | null
          month1_revenue: number | null
          month2_cash: number | null
          month2_gross_profit: number | null
          month2_gross_profit_percent: number | null
          month2_net_profit: number | null
          month2_net_profit_percent: number | null
          month2_revenue: number | null
          month3_cash: number | null
          month3_gross_profit: number | null
          month3_gross_profit_percent: number | null
          month3_net_profit: number | null
          month3_net_profit_percent: number | null
          month3_revenue: number | null
          net_profit_gap: number | null
          quarter_number: number
          quarter_year: number
          revenue_gap: number | null
          revenue_gap_percent: number | null
          total_gross_profit: number | null
          total_gross_profit_percent: number | null
          total_net_profit: number | null
          total_net_profit_percent: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          gross_profit_gap?: number | null
          id?: string
          is_active?: boolean | null
          kpi_gaps?: Json | null
          month1_cash?: number | null
          month1_gross_profit?: number | null
          month1_gross_profit_percent?: number | null
          month1_net_profit?: number | null
          month1_net_profit_percent?: number | null
          month1_revenue?: number | null
          month2_cash?: number | null
          month2_gross_profit?: number | null
          month2_gross_profit_percent?: number | null
          month2_net_profit?: number | null
          month2_net_profit_percent?: number | null
          month2_revenue?: number | null
          month3_cash?: number | null
          month3_gross_profit?: number | null
          month3_gross_profit_percent?: number | null
          month3_net_profit?: number | null
          month3_net_profit_percent?: number | null
          month3_revenue?: number | null
          net_profit_gap?: number | null
          quarter_number: number
          quarter_year: number
          revenue_gap?: number | null
          revenue_gap_percent?: number | null
          total_gross_profit?: number | null
          total_gross_profit_percent?: number | null
          total_net_profit?: number | null
          total_net_profit_percent?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          gross_profit_gap?: number | null
          id?: string
          is_active?: boolean | null
          kpi_gaps?: Json | null
          month1_cash?: number | null
          month1_gross_profit?: number | null
          month1_gross_profit_percent?: number | null
          month1_net_profit?: number | null
          month1_net_profit_percent?: number | null
          month1_revenue?: number | null
          month2_cash?: number | null
          month2_gross_profit?: number | null
          month2_gross_profit_percent?: number | null
          month2_net_profit?: number | null
          month2_net_profit_percent?: number | null
          month2_revenue?: number | null
          month3_cash?: number | null
          month3_gross_profit?: number | null
          month3_gross_profit_percent?: number | null
          month3_net_profit?: number | null
          month3_net_profit_percent?: number | null
          month3_revenue?: number | null
          net_profit_gap?: number | null
          quarter_number?: number
          quarter_year?: number
          revenue_gap?: number | null
          revenue_gap_percent?: number | null
          total_gross_profit?: number | null
          total_gross_profit_percent?: number | null
          total_net_profit?: number | null
          total_net_profit_percent?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_forecasts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      quarterly_priorities: {
        Row: {
          blockers: string | null
          business_id: string | null
          created_at: string | null
          current_value: number | null
          id: string
          last_review_date: string | null
          notes: string | null
          priority_order: number | null
          progress_percentage: number | null
          quarter_number: number
          quarter_year: number
          status: string | null
          strategic_todo_id: string | null
          success_metric: string | null
          target_value: number | null
          unit_of_measure: string | null
          updated_at: string | null
          weekly_milestones: Json | null
          why_critical: string | null
        }
        Insert: {
          blockers?: string | null
          business_id?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_review_date?: string | null
          notes?: string | null
          priority_order?: number | null
          progress_percentage?: number | null
          quarter_number: number
          quarter_year: number
          status?: string | null
          strategic_todo_id?: string | null
          success_metric?: string | null
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          weekly_milestones?: Json | null
          why_critical?: string | null
        }
        Update: {
          blockers?: string | null
          business_id?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_review_date?: string | null
          notes?: string | null
          priority_order?: number | null
          progress_percentage?: number | null
          quarter_number?: number
          quarter_year?: number
          status?: string | null
          strategic_todo_id?: string | null
          success_metric?: string | null
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          weekly_milestones?: Json | null
          why_critical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_priorities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_priorities_strategic_todo_id_fkey"
            columns: ["strategic_todo_id"]
            isOneToOne: false
            referencedRelation: "strategic_todos"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_todos: {
        Row: {
          actual_completion_date: string | null
          business_id: string | null
          created_at: string | null
          created_by: string | null
          dependencies: string[] | null
          description: string | null
          effort_level: string | null
          engine: string
          estimated_duration_days: number | null
          financial_impact: number | null
          id: string
          impact_level: string | null
          linked_assessment_gap: string | null
          linked_roadmap_stage: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          selected_for_quarter: string | null
          status: string | null
          target_completion_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          effort_level?: string | null
          engine: string
          estimated_duration_days?: number | null
          financial_impact?: number | null
          id?: string
          impact_level?: string | null
          linked_assessment_gap?: string | null
          linked_roadmap_stage?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          selected_for_quarter?: string | null
          status?: string | null
          target_completion_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          effort_level?: string | null
          engine?: string
          estimated_duration_days?: number | null
          financial_impact?: number | null
          id?: string
          impact_level?: string | null
          linked_assessment_gap?: string | null
          linked_roadmap_stage?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          selected_for_quarter?: string | null
          status?: string | null
          target_completion_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_todos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_wheels: {
        Row: {
          business_id: string | null
          communications_alignment: Json | null
          created_at: string | null
          id: string
          money_metrics: Json | null
          people_culture: Json | null
          strategy_market: Json | null
          systems_execution: Json | null
          updated_at: string | null
          vision_purpose: Json | null
        }
        Insert: {
          business_id?: string | null
          communications_alignment?: Json | null
          created_at?: string | null
          id?: string
          money_metrics?: Json | null
          people_culture?: Json | null
          strategy_market?: Json | null
          systems_execution?: Json | null
          updated_at?: string | null
          vision_purpose?: Json | null
        }
        Update: {
          business_id?: string | null
          communications_alignment?: Json | null
          created_at?: string | null
          id?: string
          money_metrics?: Json | null
          people_culture?: Json | null
          strategy_market?: Json | null
          systems_execution?: Json | null
          updated_at?: string | null
          vision_purpose?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_wheels_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      success_disciplines: {
        Row: {
          business_id: string
          created_at: string | null
          discipline_1: string
          discipline_1_score: number | null
          discipline_2: string
          discipline_2_score: number | null
          discipline_3: string
          discipline_3_score: number | null
          id: string
          selection_reason: string | null
          target_completion_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          discipline_1: string
          discipline_1_score?: number | null
          discipline_2: string
          discipline_2_score?: number | null
          discipline_3: string
          discipline_3_score?: number | null
          id?: string
          selection_reason?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          discipline_1?: string
          discipline_1_score?: number | null
          discipline_2?: string
          discipline_2_score?: number | null
          discipline_3?: string
          discipline_3_score?: number | null
          id?: string
          selection_reason?: string | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_disciplines_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      swot_action_items: {
        Row: {
          action: string
          assigned_to: string | null
          business_id: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          status: string | null
          swot_analysis_id: string | null
          swot_item_id: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          assigned_to?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          swot_analysis_id?: string | null
          swot_item_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          assigned_to?: string | null
          business_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          swot_analysis_id?: string | null
          swot_item_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swot_action_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swot_action_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swot_action_items_swot_analysis_id_fkey"
            columns: ["swot_analysis_id"]
            isOneToOne: false
            referencedRelation: "swot_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swot_action_items_swot_item_id_fkey"
            columns: ["swot_item_id"]
            isOneToOne: false
            referencedRelation: "swot_items"
            referencedColumns: ["id"]
          },
        ]
      }
      swot_analyses: {
        Row: {
          business_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          quarter: string | null
          status: string | null
          title: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          quarter?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          quarter?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "swot_analyses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swot_analyses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swot_items: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          position: number | null
          priority: number | null
          swot_analysis_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          position?: number | null
          priority?: number | null
          swot_analysis_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          position?: number | null
          priority?: number | null
          swot_analysis_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swot_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swot_items_swot_analysis_id_fkey"
            columns: ["swot_analysis_id"]
            isOneToOne: false
            referencedRelation: "swot_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_targets: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          key_kpis: Json | null
          monthly_revenue_targets: Json | null
          one_year_gross_profit_amount: number | null
          one_year_gross_profit_percent: number | null
          one_year_net_profit_amount: number | null
          one_year_net_profit_percent: number | null
          one_year_revenue: number | null
          three_year_capabilities: string[] | null
          three_year_gross_profit_amount: number | null
          three_year_gross_profit_percent: number | null
          three_year_net_profit_amount: number | null
          three_year_net_profit_percent: number | null
          three_year_revenue: number | null
          three_year_strategic_position: string | null
          three_year_team_size: number | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          key_kpis?: Json | null
          monthly_revenue_targets?: Json | null
          one_year_gross_profit_amount?: number | null
          one_year_gross_profit_percent?: number | null
          one_year_net_profit_amount?: number | null
          one_year_net_profit_percent?: number | null
          one_year_revenue?: number | null
          three_year_capabilities?: string[] | null
          three_year_gross_profit_amount?: number | null
          three_year_gross_profit_percent?: number | null
          three_year_net_profit_amount?: number | null
          three_year_net_profit_percent?: number | null
          three_year_revenue?: number | null
          three_year_strategic_position?: string | null
          three_year_team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          key_kpis?: Json | null
          monthly_revenue_targets?: Json | null
          one_year_gross_profit_amount?: number | null
          one_year_gross_profit_percent?: number | null
          one_year_net_profit_amount?: number | null
          one_year_net_profit_percent?: number | null
          one_year_revenue?: number | null
          three_year_capabilities?: string[] | null
          three_year_gross_profit_amount?: number | null
          three_year_gross_profit_percent?: number | null
          three_year_net_profit_amount?: number | null
          three_year_net_profit_percent?: number | null
          three_year_revenue?: number | null
          three_year_strategic_position?: string | null
          three_year_team_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vision_targets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_checkins: {
        Row: {
          blockers_identified: string | null
          business_id: string | null
          created_at: string | null
          created_by: string | null
          help_needed: string | null
          id: string
          on_track: boolean | null
          progress_percentage: number | null
          progress_update: string | null
          quarterly_priority_id: string | null
          week_ending_date: string
        }
        Insert: {
          blockers_identified?: string | null
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          help_needed?: string | null
          id?: string
          on_track?: boolean | null
          progress_percentage?: number | null
          progress_update?: string | null
          quarterly_priority_id?: string | null
          week_ending_date: string
        }
        Update: {
          blockers_identified?: string | null
          business_id?: string | null
          created_at?: string | null
          created_by?: string | null
          help_needed?: string | null
          id?: string
          on_track?: boolean | null
          progress_percentage?: number | null
          progress_update?: string | null
          quarterly_priority_id?: string | null
          week_ending_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_checkins_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_checkins_quarterly_priority_id_fkey"
            columns: ["quarterly_priority_id"]
            isOneToOne: false
            referencedRelation: "quarterly_priorities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
