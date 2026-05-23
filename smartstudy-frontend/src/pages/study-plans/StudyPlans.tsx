import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, GraduationCap, Calendar, Clock, Brain } from 'lucide-react'
import { studyPlanApi } from '@/services/studyPlan.service'
import { subjectApi } from '@/services/subject.service'
import { StudyPlan, Subject } from '@/types'
import toast from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'

export default function StudyPlans() {
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjects: [] as Array<{ subjectId: string; hoursPerWeek: number }>,
    startDate: '',
    endDate: '',
    isActive: false,
  })

  const queryClient = useQueryClient()

  const { data: plans, isLoading } = useQuery({
    queryKey: ['study-plans'],
    queryFn: () => studyPlanApi.getAll(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: studyPlanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] })
      toast.success('Study plan created successfully')
      setShowModal(false)
      resetForm()
    },
    onError: () => toast.error('Failed to create study plan'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudyPlan> }) => studyPlanApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] })
      toast.success('Study plan updated successfully')
      setShowModal(false)
      setEditingPlan(null)
      resetForm()
    },
    onError: () => toast.error('Failed to update study plan'),
  })

  const deleteMutation = useMutation({
    mutationFn: studyPlanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] })
      toast.success('Study plan deleted successfully')
    },
    onError: () => toast.error('Failed to delete study plan'),
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subjects: [],
      startDate: '',
      endDate: '',
      isActive: false,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    }
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (plan: StudyPlan) => {
    setEditingPlan(plan)
    setFormData({
      title: plan.title,
      description: plan.description || '',
      subjects: plan.subjects,
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      endDate: new Date(plan.endDate).toISOString().split('T')[0],
      isActive: plan.isActive,
    })
    setShowModal(true)
  }

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { subjectId: '', hoursPerWeek: 5 }],
    })
  }

  const updateSubject = (index: number, field: string, value: any) => {
    const updated = [...formData.subjects]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, subjects: updated })
  }

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Plans</h1>
          <p className="text-muted-foreground mt-1">Organize your study schedule</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading study plans...</div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={cn(
                'bg-card border rounded-xl p-6 hover:shadow-md transition-shadow',
                plan.isActive ? 'border-primary' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    plan.aiGenerated ? 'bg-purple-100' : 'bg-blue-100'
                  )}>
                    {plan.aiGenerated ? (
                      <Brain className="w-6 h-6 text-purple-600" />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.title}</h3>
                    {plan.isActive && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    {plan.aiGenerated && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
                        AI Generated
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure?')) deleteMutation.mutate(plan._id)
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{plan.description || 'No description'}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {plan.subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0)} hrs/week
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {plan.subjects.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {typeof s.subjectId === 'object' ? s.subjectId.name : 'Subject'} ({s.hoursPerWeek}h)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No study plans yet</h3>
          <p className="text-muted-foreground mt-1">Create your first study plan</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingPlan ? 'Edit Study Plan' : 'Create Study Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Subjects</label>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="text-sm text-primary hover:underline"
                  >
                    + Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={subject.subjectId}
                        onChange={(e) => updateSubject(index, 'subjectId', e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Subject</option>
                        {subjects?.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={subject.hoursPerWeek}
                        onChange={(e) => updateSubject(index, 'hoursPerWeek', parseInt(e.target.value) || 0)}
                        className="w-24 px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Hours"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm">Set as active plan</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
