# KPI Library - Quick Reference Guide

Quick commands and code snippets for working with the KPI library.

---

## 🚀 Common Tasks

### Import All KPIs
```typescript
import { allKPIs } from '@/lib/kpi/data/registry'
```

### Import Specific Function KPIs
```typescript
import { profitKPIs } from '@/lib/kpi/data/functions/profit'
import { peopleKPIs } from '@/lib/kpi/data/functions/people'
import { deliverOperationsKPIs } from '@/lib/kpi/data/functions/deliver-operations'
```

### Import Essential KPIs
```typescript
import { essentialKPIs } from '@/lib/kpi/data/essential'
// These 10 KPIs every business should track
```

---

## 🔍 Filtering KPIs

### By Business Function
```typescript
// Get all DELIVER KPIs
const deliverKPIs = allKPIs.filter(kpi => kpi.function === 'DELIVER')

// Get all PROFIT KPIs
const profitKPIs = allKPIs.filter(kpi => kpi.function === 'PROFIT')
```

### By Industry
```typescript
// Get KPIs for construction trades
const constructionKPIs = allKPIs.filter(kpi => 
  kpi.industries.includes('construction-trades') || 
  kpi.industries.includes('all')
)

// Get KPIs for retail/ecommerce
const retailKPIs = allKPIs.filter(kpi => 
  kpi.industries.includes('retail-ecommerce') || 
  kpi.industries.includes('all')
)
```

### By Business Stage
```typescript
// Get KPIs for foundation stage
const foundationKPIs = allKPIs.filter(kpi => 
  kpi.stages.includes('foundation')
)

// Get KPIs for growth stage
const growthKPIs = allKPIs.filter(kpi => 
  kpi.stages.includes('growth')
)
```

### By Tier
```typescript
// Essential KPIs only
const essentials = allKPIs.filter(kpi => kpi.tier === 'essential')

// Recommended KPIs
const recommended = allKPIs.filter(kpi => kpi.tier === 'recommended')

// Advanced KPIs
const advanced = allKPIs.filter(kpi => kpi.tier === 'advanced')
```

### Combined Filters
```typescript
// Essential DELIVER KPIs for construction in growth stage
const targetKPIs = allKPIs.filter(kpi => 
  kpi.function === 'DELIVER' &&
  kpi.tier === 'essential' &&
  (kpi.industries.includes('construction-trades') || kpi.industries.includes('all')) &&
  kpi.stages.includes('growth')
)
```

---

## 📊 KPI Counts by Function

```typescript
const countsByFunction = {
  ESSENTIAL: 10,
  ATTRACT: 32,
  CONVERT: 26,
  DELIVER: 73,   // (25 ops + 15 quality + 18 people + 15 systems)
  DELIGHT: 31,
  PROFIT: 25,
  PEOPLE: 24,
  SYSTEMS: 26
}
```

---

## 🎨 Display Components

### Basic KPI Card
```typescript
import { Card } from '@/components/ui/card'

function KPICard({ kpi }: { kpi: KPIDefinition }) {
  const Icon = kpi.icon
  
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <div>
          <h3>{kpi.name}</h3>
          <p className="text-sm text-muted-foreground">
            {kpi.plainName}
          </p>
        </div>
      </div>
      <p className="mt-2">{kpi.description}</p>
    </Card>
  )
}
```

### KPI with Benchmarks
```typescript
function KPIBenchmark({ kpi }: { kpi: KPIDefinition }) {
  return (
    <div className="space-y-2">
      <h4>{kpi.name}</h4>
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-xs text-muted-foreground">Poor</div>
          <div className="font-semibold">{kpi.benchmarks.poor}</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-xs text-muted-foreground">Average</div>
          <div className="font-semibold">{kpi.benchmarks.average}</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-xs text-muted-foreground">Good</div>
          <div className="font-semibold">{kpi.benchmarks.good}</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-xs text-muted-foreground">Excellent</div>
          <div className="font-semibold">{kpi.benchmarks.excellent}</div>
        </div>
      </div>
    </div>
  )
}
```

---

## 💾 LocalStorage Helpers

### Save Selected KPIs
```typescript
function saveSelectedKPIs(kpiIds: string[]) {
  localStorage.setItem('selectedKPIs', JSON.stringify(kpiIds))
}
```

### Load Selected KPIs
```typescript
function loadSelectedKPIs(): string[] {
  const stored = localStorage.getItem('selectedKPIs')
  return stored ? JSON.parse(stored) : []
}
```

### Get Full KPI Objects
```typescript
function getSelectedKPIs(): KPIDefinition[] {
  const selectedIds = loadSelectedKPIs()
  return allKPIs.filter(kpi => selectedIds.includes(kpi.id))
}
```

### Save KPI Values
```typescript
interface KPIValue {
  kpiId: string
  value: number
  date: string
  target?: number
}

function saveKPIValue(value: KPIValue) {
  const key = 'kpiValues'
  const stored = localStorage.getItem(key)
  const values: KPIValue[] = stored ? JSON.parse(stored) : []
  values.push(value)
  localStorage.setItem(key, JSON.stringify(values))
}
```

---

## 🎯 Recommendation Engine

### Basic Recommendation Logic
```typescript
function recommendKPIs(
  industry: string,
  stage: string,
  businessFunction?: string
): KPIDefinition[] {
  return allKPIs.filter(kpi => {
    // Must match industry
    const matchesIndustry = 
      kpi.industries.includes(industry) || 
      kpi.industries.includes('all')
    
    // Must match stage
    const matchesStage = kpi.stages.includes(stage)
    
    // Must match function (if specified)
    const matchesFunction = businessFunction 
      ? kpi.function === businessFunction 
      : true
    
    // Prioritize essential tier
    const isEssential = kpi.tier === 'essential'
    
    return matchesIndustry && matchesStage && matchesFunction && isEssential
  })
}

// Usage
const recommendations = recommendKPIs('construction-trades', 'growth', 'DELIVER')
```

### Score-Based Recommendations
```typescript
function scoreKPI(kpi: KPIDefinition, context: {
  industry: string
  stage: string
  gaps: string[]  // From assessment
}): number {
  let score = 0
  
  // Industry match
  if (kpi.industries.includes(context.industry)) score += 30
  else if (kpi.industries.includes('all')) score += 20
  
  // Stage match
  if (kpi.stages.includes(context.stage)) score += 30
  
  // Tier priority
  if (kpi.tier === 'essential') score += 30
  else if (kpi.tier === 'recommended') score += 20
  else score += 10
  
  // Gap alignment
  const kpiCategory = kpi.category.toLowerCase()
  if (context.gaps.some(gap => gap.toLowerCase().includes(kpiCategory))) {
    score += 20
  }
  
  return score
}

// Get top recommendations
function getTopRecommendations(context: any, limit = 10): KPIDefinition[] {
  return allKPIs
    .map(kpi => ({ kpi, score: scoreKPI(kpi, context) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.kpi)
}
```

---

## 🔢 Value Formatting

### Format by Unit Type
```typescript
function formatKPIValue(value: number, unit: string): string {
  switch (unit) {
    case 'percentage':
      return `${value}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(value)
    case 'number':
      return value.toLocaleString()
    case 'hours':
      return `${value}h`
    case 'days':
      return `${value}d`
    case 'milliseconds':
      return `${value}ms`
    default:
      return value.toString()
  }
}
```

### Compare to Benchmarks
```typescript
function getBenchmarkLevel(
  value: number, 
  benchmarks: KPIDefinition['benchmarks']
): 'poor' | 'average' | 'good' | 'excellent' {
  if (value >= benchmarks.excellent) return 'excellent'
  if (value >= benchmarks.good) return 'good'
  if (value >= benchmarks.average) return 'average'
  return 'poor'
}

function getBenchmarkColor(level: string): string {
  switch (level) {
    case 'excellent': return 'text-green-600 bg-green-50'
    case 'good': return 'text-blue-600 bg-blue-50'
    case 'average': return 'text-yellow-600 bg-yellow-50'
    case 'poor': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}
```

---

## 📈 Trend Analysis

### Calculate Trend
```typescript
interface DataPoint {
  date: string
  value: number
}

function calculateTrend(data: DataPoint[]): 'up' | 'down' | 'flat' {
  if (data.length < 2) return 'flat'
  
  const recent = data.slice(-3).map(d => d.value)
  const older = data.slice(-6, -3).map(d => d.value)
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100
  
  if (change > 5) return 'up'
  if (change < -5) return 'down'
  return 'flat'
}
```

---

## 🏷️ Tag-Based Search

### Search KPIs by Tags
```typescript
function searchByTags(tags: string[]): KPIDefinition[] {
  return allKPIs.filter(kpi =>
    tags.some(tag => kpi.tags.includes(tag))
  )
}

// Example
const productivityKPIs = searchByTags(['productivity', 'efficiency'])
const customerKPIs = searchByTags(['customer-satisfaction', 'retention'])
```

### Get All Unique Tags
```typescript
function getAllTags(): string[] {
  const tagSet = new Set<string>()
  allKPIs.forEach(kpi => {
    kpi.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}
```

---

## 🎨 Industry & Stage Constants

### Available Industries
```typescript
const INDUSTRIES = [
  'all',
  'construction-trades',
  'professional-services',
  'retail-ecommerce',
  'health-wellness',
  'operations-logistics'
] as const
```

### Available Stages
```typescript
const STAGES = [
  'foundation',
  'traction',
  'growth',
  'scale',
  'optimization',
  'leadership'
] as const
```

### Business Functions
```typescript
const FUNCTIONS = [
  'ESSENTIAL',
  'ATTRACT',
  'CONVERT',
  'DELIVER',
  'DELIGHT',
  'PROFIT',
  'PEOPLE',
  'SYSTEMS'
] as const
```

---

## 🧪 Testing Utilities

### Validate KPI Structure
```typescript
function validateKPI(kpi: any): boolean {
  const required = [
    'id', 'name', 'plainName', 'function', 'category', 
    'tier', 'industries', 'stages', 'unit', 'frequency',
    'description', 'whyItMatters', 'actionToTake', 'formula',
    'benchmarks', 'icon', 'tags', 'createdAt', 'updatedAt'
  ]
  
  return required.every(field => kpi.hasOwnProperty(field))
}
```

### Check for Duplicates
```typescript
function findDuplicateIds(): string[] {
  const ids = allKPIs.map(kpi => kpi.id)
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
  return [...new Set(duplicates)]
}
```

---

## 📱 Responsive Display

### Mobile-Friendly KPI Grid
```typescript
function KPIGrid({ kpis }: { kpis: KPIDefinition[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map(kpi => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
```

---

## 🎯 Quick Stats

```typescript
// Total KPIs
const totalKPIs = allKPIs.length  // 247

// By tier
const essentialCount = allKPIs.filter(k => k.tier === 'essential').length  // 77
const recommendedCount = allKPIs.filter(k => k.tier === 'recommended').length
const advancedCount = allKPIs.filter(k => k.tier === 'advanced').length

// By function
const functionCounts = {
  ESSENTIAL: essentialKPIs.length,      // 10
  ATTRACT: attractKPIs.length,          // 32
  CONVERT: convertKPIs.length,          // 26
  DELIVER: deliverOperationsKPIs.length + 
           deliverQualityKPIs.length + 
           deliverPeopleKPIs.length + 
           deliverSystemsKPIs.length,   // 73
  DELIGHT: delightKPIs.length,          // 31
  PROFIT: profitKPIs.length,            // 25
  PEOPLE: peopleKPIs.length,            // 24
  SYSTEMS: systemsKPIs.length           // 26
}
```

---

**Pro Tip:** Save this file in your project at:
```
/Users/mattmalouf/Desktop/business-coaching-platform/docs/QUICK-REFERENCE.md
```