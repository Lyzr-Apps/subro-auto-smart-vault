import { useState } from 'react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Home,
  Users,
  Filter,
  Search,
  RefreshCw,
  Send,
  Download,
  ArrowLeft,
  PoundSterling,
  Calendar,
  Building,
  ShieldCheck,
  CheckCircle2,
  User,
  Zap
} from 'lucide-react'

// =============================================================================
// Agent IDs from workflow.json
// =============================================================================
const AGENT_IDS = {
  DATA_AGGREGATION: '696f47e43bd35d7a6606b38f',
  VALIDATION_COMPLIANCE: '696f4809b50537828e0b0e31',
  SUBROGATION_COORDINATOR: '696f48343bd35d7a6606b3a8',
  OUTLAY_DOCUMENT: '696f4874b50537828e0b0e48'
}

// =============================================================================
// TypeScript Interfaces (from actual test responses)
// =============================================================================

// Subrogation Coordinator Response
interface CaseSummary {
  case_id: string
  case_status: string
  processing_timestamp: string
  overall_assessment: string
}

interface ClaimSummary {
  claim_number: string
  claimant: string
  incident_date: string
  incident_description: string
  claim_date: string
  claim_status: string
}

interface PolicySummary {
  policy_number: string
  policy_holder: string
  policy_type: string
  coverage_limits: {
    bodily_injury: number
    property_damage: number
    collision: number
    deductible: number
  }
  effective_dates: {
    start: string
    end: string
  }
}

interface LiabilitySummary {
  liability_percentage: number
  at_fault_party: string
  determination: string
  supporting_evidence: string[]
}

interface FinancialSummary {
  total_recovery_amount: number
  repair_costs: number
  expected_recovery_percentage: number
}

interface AggregatedData {
  claim_summary: ClaimSummary
  policy_summary: PolicySummary
  liability_summary: LiabilitySummary
  financial_summary: FinancialSummary
  data_completeness: number
}

interface ValidationStatus {
  overall_validation: string
  validation_score: number
  data_accuracy_status: string
  liability_clarity_status: string
  documentation_status: string
  compliance_status: string
}

interface Discrepancy {
  category: string
  description: string
  severity: string
  source: string
  requires_action: boolean
}

interface ExceptionFlag {
  flag_type: string
  description: string
  urgency: string
  recommended_action: string
}

interface FraudAssessment {
  risk_level: string
  requires_investigation: boolean
  fraud_score: number
}

interface NextStep {
  priority: string
  action: string
  assigned_to: string
  deadline: string
}

interface CoordinatorResult {
  case_summary: CaseSummary
  aggregated_data: AggregatedData
  validation_status: ValidationStatus
  discrepancies_identified: Discrepancy[]
  exception_flags: ExceptionFlag[]
  fraud_assessment: FraudAssessment
  legal_review_required: boolean
  next_steps: NextStep[]
  ready_for_outlay_generation: boolean
}

// Outlay Document Response
interface DocumentMetadata {
  document_id: string
  document_type: string
  template_used: string
  generated_timestamp: string
  case_reference: string
}

interface BreakdownItem {
  category: string
  description: string
  amount: number
}

interface RecoveryCalculation {
  total_damages: number
  liability_percentage: number
  recoverable_amount: number
  administrative_fees: number
  final_recovery_amount: number
}

interface OutlaySummary {
  total_recovery_amount: number
  currency: string
  breakdown: BreakdownItem[]
  recovery_calculation: RecoveryCalculation
}

interface CaseDetailsIncluded {
  claim_number: string
  policy_number: string
  claimant_name: string
  incident_date: string
  liability_party: string
  liability_percentage: number
}

interface SupportingDocumentation {
  police_report_referenced: boolean
  repair_estimates_included: boolean
  witness_statements_included: boolean
  photos_attached: boolean
  policy_documents_referenced: boolean
}

interface AuditTrailStep {
  step: string
  timestamp: string
  action: string
  data_source: string
}

interface ValidationChecksPassed {
  data_completeness: boolean
  calculation_accuracy: boolean
  template_compliance: boolean
  regulatory_compliance: boolean
}

interface DocumentSections {
  executive_summary: string
  incident_details: string
  liability_assessment: string
  financial_breakdown: string
  supporting_evidence: string
  recovery_recommendation: string
}

interface OutlayDocumentResult {
  document_metadata: DocumentMetadata
  outlay_summary: OutlaySummary
  case_details_included: CaseDetailsIncluded
  supporting_documentation: SupportingDocumentation
  audit_trail: AuditTrailStep[]
  validation_checks_passed: ValidationChecksPassed
  document_sections: DocumentSections
  document_status: string
  next_actions: NextStep[]
}

// Sample case data
interface CaseData {
  id: string
  claimNumber: string
  claimant: string
  thirdParty: string
  recoveryAmount: number
  daysOpen: number
  status: 'pending' | 'flagged' | 'in_progress' | 'escalated' | 'completed'
  priority: 'high' | 'medium' | 'low'
}

// =============================================================================
// Sample Data
// =============================================================================
const SAMPLE_CASES: CaseData[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-78432',
    claimant: 'J. Smith',
    thirdParty: 'ABC Insurance',
    recoveryAmount: 4200,
    daysOpen: 45,
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-78419',
    claimant: 'M. Johnson',
    thirdParty: 'XYZ Motors',
    recoveryAmount: 2850,
    daysOpen: 32,
    status: 'pending',
    priority: 'low'
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-78405',
    claimant: 'S. Williams',
    thirdParty: 'Direct Line',
    recoveryAmount: 7500,
    daysOpen: 58,
    status: 'flagged',
    priority: 'high'
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-78390',
    claimant: 'R. Brown',
    thirdParty: 'General Insurance',
    recoveryAmount: 3100,
    daysOpen: 21,
    status: 'pending',
    priority: 'low'
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-78378',
    claimant: 'P. Davis',
    thirdParty: 'Churchill',
    recoveryAmount: 5600,
    daysOpen: 67,
    status: 'flagged',
    priority: 'high'
  }
]

// =============================================================================
// Helper Components
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
    pending: { label: 'Pending', variant: 'outline' },
    flagged: { label: 'Flagged', variant: 'destructive' },
    in_progress: { label: 'In Progress', variant: 'default' },
    escalated: { label: 'Escalated', variant: 'secondary' },
    completed: { label: 'Completed', variant: 'secondary' }
  }

  const config = statusMap[status] || statusMap.pending
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const priorityMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' }> = {
    high: { variant: 'destructive' },
    medium: { variant: 'default' },
    low: { variant: 'secondary' }
  }

  const config = priorityMap[priority] || priorityMap.medium
  return <Badge variant={config.variant}>{priority.toUpperCase()}</Badge>
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'CRITICAL') {
    return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> CRITICAL</Badge>
  }
  if (severity === 'WARNING') {
    return <Badge variant="default" className="gap-1"><AlertTriangle className="h-3 w-3" /> WARNING</Badge>
  }
  return <Badge variant="outline">{severity}</Badge>
}

function ValidationScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return <Badge className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> PASS ({score}%)</Badge>
  }
  if (score >= 50) {
    return <Badge variant="default" className="gap-1"><AlertTriangle className="h-3 w-3" /> REVIEW ({score}%)</Badge>
  }
  return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> FAIL ({score}%)</Badge>
}

// =============================================================================
// Screen 1: Case Dashboard
// =============================================================================

function CaseDashboard({ onSelectCase }: { onSelectCase: (caseData: CaseData) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredCases = SAMPLE_CASES.filter(c => {
    const matchesSearch = c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.claimant.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0033A0]">Subrogation Recovery Queue</h1>
          <p className="text-gray-600 mt-1">Review and process pending recovery cases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0033A0]">{SAMPLE_CASES.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {SAMPLE_CASES.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {SAMPLE_CASES.filter(c => c.status === 'flagged').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{SAMPLE_CASES.reduce((sum, c) => sum + c.recoveryAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by claim number or claimant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'flagged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('flagged')}
          >
            Flagged
          </Button>
        </div>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Cases</CardTitle>
          <CardDescription>Click on a case to begin processing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Number</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead>Third Party</TableHead>
                <TableHead className="text-right">Recovery Amount</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseData) => (
                <TableRow key={caseData.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{caseData.claimNumber}</TableCell>
                  <TableCell>{caseData.claimant}</TableCell>
                  <TableCell>{caseData.thirdParty}</TableCell>
                  <TableCell className="text-right font-medium">
                    £{caseData.recoveryAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3 w-3" />
                      {caseData.daysOpen} days
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={caseData.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={caseData.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onSelectCase(caseData)}
                      className="bg-[#0033A0] hover:bg-[#002080] gap-2"
                    >
                      Process Case
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Screen 2: Case Processing View
// =============================================================================

function CaseProcessingView({
  selectedCase,
  onBack,
  onGenerateOutlay
}: {
  selectedCase: CaseData
  onBack: () => void
  onGenerateOutlay: (result: CoordinatorResult) => void
}) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<CoordinatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processCase = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const message = `Process case ${selectedCase.claimNumber} for ${selectedCase.claimant} vs ${selectedCase.thirdParty}, estimated recovery £${selectedCase.recoveryAmount}`

      const result = await callAIAgent(message, AGENT_IDS.SUBROGATION_COORDINATOR)

      if (result.success && result.response.status === 'success') {
        setResponse(result.response.result as CoordinatorResult)
      } else {
        setError(result.error || result.response.message || 'Processing failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0033A0]">{selectedCase.claimNumber}</h1>
            <p className="text-gray-600 mt-1">
              {selectedCase.claimant} vs {selectedCase.thirdParty}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={processCase}
            disabled={loading}
            className="bg-[#0033A0] hover:bg-[#002080] gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Process Case
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#0033A0]" />
              <div className="text-center">
                <p className="text-lg font-medium">Processing Case...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Aggregating data and validating compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {response && (
        <div className="space-y-6">
          {/* Case Summary */}
          <Card className="border-2 border-[#0033A0]">
            <CardHeader className="bg-[#0033A0] text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Case Status</p>
                  <p className="font-medium text-lg">{response.case_summary.case_status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="font-medium">
                    {new Date(response.case_summary.processing_timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Overall Assessment</p>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{response.case_summary.overall_assessment}</AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three Column Layout */}
          <div className="grid grid-cols-3 gap-4">
            {/* Column 1: Aggregated Data */}
            <Card className="col-span-1">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {/* Claim Summary */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Claim Details</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number:</span>
                          <span className="font-medium">
                            {response.aggregated_data.claim_summary.claim_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Claimant:</span>
                          <span className="font-medium">
                            {response.aggregated_data.claim_summary.claimant}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Incident Date:</span>
                          <span className="font-medium">
                            {response.aggregated_data.claim_summary.incident_date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Financial Summary */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Financial</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recovery Amount:</span>
                          <span className="font-bold text-green-600">
                            £{response.aggregated_data.financial_summary.total_recovery_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Repair Costs:</span>
                          <span className="font-medium">
                            £{response.aggregated_data.financial_summary.repair_costs.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recovery %:</span>
                          <span className="font-medium">
                            {response.aggregated_data.financial_summary.expected_recovery_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Liability */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Liability Assessment</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">At Fault:</span>
                          <p className="font-medium">
                            {response.aggregated_data.liability_summary.at_fault_party}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Percentage:</span>
                          <p className="font-bold text-[#0033A0]">
                            {response.aggregated_data.liability_summary.liability_percentage}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Supporting Evidence:</span>
                          <ul className="mt-1 space-y-1">
                            {response.aggregated_data.liability_summary.supporting_evidence.map(
                              (evidence, i) => (
                                <li key={i} className="text-xs flex items-start gap-1">
                                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                  <span>{evidence}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Data Completeness */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Data Completeness</p>
                      <Progress value={response.aggregated_data.data_completeness} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {response.aggregated_data.data_completeness}% complete
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Column 2: Validation Status */}
            <Card className="col-span-1">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Validation & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {/* Overall Validation */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Overall Status</p>
                      <ValidationScoreBadge score={response.validation_status.validation_score} />
                      <p className="text-sm mt-2 font-medium">
                        {response.validation_status.overall_validation}
                      </p>
                    </div>

                    <Separator />

                    {/* Detailed Status */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Data Accuracy</p>
                        <p className="text-sm">{response.validation_status.data_accuracy_status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Liability Clarity</p>
                        <p className="text-sm">{response.validation_status.liability_clarity_status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Documentation</p>
                        <p className="text-sm">{response.validation_status.documentation_status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Compliance</p>
                        <p className="text-sm">{response.validation_status.compliance_status}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Fraud Assessment */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Fraud Assessment</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Risk Level:</span>
                          <Badge
                            variant={
                              response.fraud_assessment.risk_level === 'LOW'
                                ? 'secondary'
                                : response.fraud_assessment.risk_level === 'MEDIUM'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {response.fraud_assessment.risk_level}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fraud Score:</span>
                          <span className="font-medium">{response.fraud_assessment.fraud_score}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Investigation:</span>
                          <span className="font-medium">
                            {response.fraud_assessment.requires_investigation ? 'Required' : 'Not Required'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Column 3: Discrepancies & Flags */}
            <Card className="col-span-1">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues & Exceptions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {/* Discrepancies */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Discrepancies Identified</p>
                      <div className="space-y-2">
                        {response.discrepancies_identified.map((disc, i) => (
                          <Alert key={i} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-sm flex items-center justify-between">
                              {disc.category}
                              <SeverityBadge severity={disc.severity} />
                            </AlertTitle>
                            <AlertDescription className="text-xs mt-2">
                              {disc.description}
                            </AlertDescription>
                            <p className="text-xs text-gray-600 mt-2">Source: {disc.source}</p>
                          </Alert>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Exception Flags */}
                    <div>
                      <p className="font-semibold text-sm mb-2">Exception Flags</p>
                      <div className="space-y-2">
                        {response.exception_flags.map((flag, i) => (
                          <div key={i} className="border border-orange-300 rounded p-2 bg-orange-50">
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-medium text-xs">{flag.flag_type}</p>
                              <Badge variant="outline" className="text-xs">
                                {flag.urgency}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700 mb-2">{flag.description}</p>
                            <p className="text-xs text-gray-600">
                              <strong>Action:</strong> {flag.recommended_action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Legal Review */}
                    {response.legal_review_required && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Legal Review Required</AlertTitle>
                        <AlertDescription className="text-xs">
                          This case requires legal review before proceeding with recovery.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {response.next_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 border-l-4 border-[#0033A0] pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={step.priority.toLowerCase()} />
                        <p className="font-medium text-sm">{step.action}</p>
                      </div>
                      <p className="text-xs text-gray-600">Assigned to: {step.assigned_to}</p>
                      <p className="text-xs text-gray-600">
                        Deadline: {new Date(step.deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                Return to Queue
              </Button>
              {response.ready_for_outlay_generation ? (
                <Button
                  onClick={() => onGenerateOutlay(response)}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Generate Outlay Document
                </Button>
              ) : (
                <Button disabled variant="outline" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Outlay Not Available (Resolve Issues First)
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Initial State - No Processing Yet */}
      {!loading && !response && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Process</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click "Process Case" to aggregate data and validate compliance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =============================================================================
// Screen 3: Outlay Document Review
// =============================================================================

function OutlayDocumentReview({
  caseData,
  coordinatorResult,
  onBack,
  onApprove
}: {
  caseData: CaseData
  coordinatorResult: CoordinatorResult
  onBack: () => void
  onApprove: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState<OutlayDocumentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  const generateDocument = async () => {
    setLoading(true)
    setError(null)
    setDocument(null)

    try {
      const message = `Generate outlay document for claim ${caseData.claimNumber}. Claimant: ${caseData.claimant}. Third Party: ${caseData.thirdParty}. Recovery Amount: £${caseData.recoveryAmount}. Liability: 100% third party fault. Documents validated.`

      const result = await callAIAgent(message, AGENT_IDS.OUTLAY_DOCUMENT)

      if (result.success && result.response.status === 'success') {
        setDocument(result.response.result as OutlayDocumentResult)
      } else {
        setError(result.error || result.response.message || 'Document generation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setApproving(false)
    onApprove()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Processing
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0033A0]">Outlay Document Review</h1>
            <p className="text-gray-600 mt-1">{caseData.claimNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!document && (
            <Button
              onClick={generateDocument}
              disabled={loading}
              className="bg-[#0033A0] hover:bg-[#002080] gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Document
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#0033A0]" />
              <div className="text-center">
                <p className="text-lg font-medium">Generating Outlay Document...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Compiling case data and calculating recovery amounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Display */}
      {document && (
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Document Preview */}
          <div className="col-span-2">
            <Card className="border-2 border-[#0033A0]">
              <CardHeader className="bg-[#0033A0] text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {document.document_metadata.document_type}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white text-[#0033A0]">
                    {document.document_status}
                  </Badge>
                </div>
                <CardDescription className="text-blue-100">
                  {document.document_metadata.document_id} | Generated:{' '}
                  {new Date(document.document_metadata.generated_timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {/* Executive Summary */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#0033A0]">Executive Summary</h3>
                      <p className="text-sm">{document.document_sections.executive_summary}</p>
                    </div>

                    <Separator />

                    {/* Financial Breakdown */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 text-[#0033A0]">Financial Breakdown</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-green-700">
                            Total Recovery Amount
                          </span>
                          <span className="text-3xl font-bold text-green-700">
                            £{document.outlay_summary.total_recovery_amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-green-600">
                          {document.outlay_summary.currency}
                        </p>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {document.outlay_summary.breakdown.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{item.category}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {item.description}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                £{item.amount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm">{document.document_sections.financial_breakdown}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Incident Details */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#0033A0]">Incident Details</h3>
                      <p className="text-sm">{document.document_sections.incident_details}</p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Claim Number</p>
                          <p className="font-medium">{document.case_details_included.claim_number}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Claimant</p>
                          <p className="font-medium">{document.case_details_included.claimant_name}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Liability Party</p>
                          <p className="font-medium">{document.case_details_included.liability_party}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Liability %</p>
                          <p className="font-medium">
                            {document.case_details_included.liability_percentage}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Liability Assessment */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#0033A0]">Liability Assessment</h3>
                      <p className="text-sm">{document.document_sections.liability_assessment}</p>
                    </div>

                    <Separator />

                    {/* Supporting Evidence */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#0033A0]">Supporting Evidence</h3>
                      <p className="text-sm mb-3">{document.document_sections.supporting_evidence}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          {document.supporting_documentation.police_report_referenced ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>Police Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.supporting_documentation.repair_estimates_included ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>Repair Estimates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.supporting_documentation.witness_statements_included ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>Witness Statements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.supporting_documentation.photos_attached ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>Photos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {document.supporting_documentation.policy_documents_referenced ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>Policy Documents</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Recovery Recommendation */}
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#0033A0]">Recovery Recommendation</h3>
                      <Alert className="border-green-600 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm">
                          {document.document_sections.recovery_recommendation}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-between">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  {approving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Approve & Initiate Recovery
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Audit Trail & Validation */}
          <div className="col-span-1 space-y-4">
            {/* Validation Checks */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Validation Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Completeness</span>
                    {document.validation_checks_passed.data_completeness ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Calculation Accuracy</span>
                    {document.validation_checks_passed.calculation_accuracy ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Template Compliance</span>
                    {document.validation_checks_passed.template_compliance ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regulatory Compliance</span>
                    {document.validation_checks_passed.regulatory_compliance ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Calculation */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PoundSterling className="h-4 w-4" />
                  Recovery Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Damages:</span>
                    <span className="font-medium">
                      £{document.outlay_summary.recovery_calculation.total_damages.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liability %:</span>
                    <span className="font-medium">
                      {document.outlay_summary.recovery_calculation.liability_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recoverable Amount:</span>
                    <span className="font-medium">
                      £
                      {document.outlay_summary.recovery_calculation.recoverable_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin Fees:</span>
                    <span className="font-medium">
                      £
                      {document.outlay_summary.recovery_calculation.administrative_fees.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold">Final Recovery:</span>
                    <span className="font-bold text-green-600">
                      £
                      {document.outlay_summary.recovery_calculation.final_recovery_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {document.audit_trail.map((step, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-[#0033A0] pl-3 pb-3 relative"
                      >
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#0033A0]" />
                        <p className="font-medium text-xs">{step.step}</p>
                        <p className="text-xs text-gray-600 mt-1">{step.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {step.data_source}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !document && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click "Generate Document" to create the outlay document for recovery
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =============================================================================
// Screen 4: Supervisor Queue (Escalations)
// =============================================================================

function SupervisorQueue({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const escalatedCases = SAMPLE_CASES.filter(c => c.status === 'flagged' || c.status === 'escalated')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0033A0]">Supervisor Escalation Queue</h1>
          <p className="text-gray-600 mt-1">
            Review cases requiring supervisor attention or approval
          </p>
        </div>
        <Button variant="outline" onClick={onBackToDashboard} className="gap-2">
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Escalations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{escalatedCases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Requires Legal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fraud Investigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Escalated Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Cases Requiring Review</CardTitle>
          <CardDescription>
            High-priority cases with validation issues or compliance concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escalatedCases.map(caseData => (
              <div key={caseData.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{caseData.claimNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {caseData.claimant} vs {caseData.thirdParty}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <PriorityBadge priority={caseData.priority} />
                    <StatusBadge status={caseData.status} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Recovery Amount</p>
                    <p className="font-bold">£{caseData.recoveryAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Days Open</p>
                    <p className="font-medium">{caseData.daysOpen} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Escalation Reason</p>
                    <p className="font-medium text-xs">Data integrity issues detected</p>
                  </div>
                </div>

                <Alert className="mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Supervisor Action Required</AlertTitle>
                  <AlertDescription className="text-xs">
                    Critical discrepancies identified between data aggregation and validation
                    results. Manual review and system audit recommended before proceeding.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Eye className="h-3 w-3" />
                    Review Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Users className="h-3 w-3" />
                    Assign to Legal
                  </Button>
                  <Button size="sm" className="bg-[#0033A0] hover:bg-[#002080] gap-2">
                    <Send className="h-3 w-3" />
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// Main Home Component
// =============================================================================

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'processing' | 'outlay' | 'supervisor'
  >('dashboard')
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null)
  const [coordinatorResult, setCoordinatorResult] = useState<CoordinatorResult | null>(null)

  const handleSelectCase = (caseData: CaseData) => {
    setSelectedCase(caseData)
    setCurrentScreen('processing')
  }

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard')
    setSelectedCase(null)
    setCoordinatorResult(null)
  }

  const handleGenerateOutlay = (result: CoordinatorResult) => {
    setCoordinatorResult(result)
    setCurrentScreen('outlay')
  }

  const handleBackToProcessing = () => {
    setCurrentScreen('processing')
  }

  const handleApproveDocument = () => {
    // In a real app, this would trigger the recovery process
    alert('Recovery process initiated! Case status updated to "In Recovery".')
    handleBackToDashboard()
  }

  const handleOpenSupervisor = () => {
    setCurrentScreen('supervisor')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Aviva Header */}
      <header className="bg-[#0033A0] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Aviva</h1>
                <p className="text-xs text-blue-200">Subrogation Recovery Assistant</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Button
                variant={currentScreen === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={handleBackToDashboard}
                className="text-white hover:bg-blue-800"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentScreen === 'supervisor' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={handleOpenSupervisor}
                className="text-white hover:bg-blue-800"
              >
                <Users className="h-4 w-4 mr-2" />
                Supervisor Queue
              </Button>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-blue-700">
                <User className="h-4 w-4" />
                <span className="text-sm">Admin User</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentScreen === 'dashboard' && <CaseDashboard onSelectCase={handleSelectCase} />}

        {currentScreen === 'processing' && selectedCase && (
          <CaseProcessingView
            selectedCase={selectedCase}
            onBack={handleBackToDashboard}
            onGenerateOutlay={handleGenerateOutlay}
          />
        )}

        {currentScreen === 'outlay' && selectedCase && coordinatorResult && (
          <OutlayDocumentReview
            caseData={selectedCase}
            coordinatorResult={coordinatorResult}
            onBack={handleBackToProcessing}
            onApprove={handleApproveDocument}
          />
        )}

        {currentScreen === 'supervisor' && (
          <SupervisorQueue onBackToDashboard={handleBackToDashboard} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Aviva Subrogation Recovery Assistant v1.0 | Powered by AI Agents</p>
            <p>Lyzr Agent Framework | {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
