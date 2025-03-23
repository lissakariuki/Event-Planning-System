"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTeam } from "@/contexts/team-context"

interface BudgetCategory {
  name: string
  allocated: number
  spent: number
}

export default function BudgetPage() {
  const { teams, updateTeamBudget } = useTeam()
  const [totalBudget, setTotalBudget] = useState(0)
  const [currentBudget, setCurrentBudget] = useState(0)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [newBudget, setNewBudget] = useState({ current: "", total: "" })

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { name: "Venue", allocated: 5000, spent: 0 },
    { name: "Catering", allocated: 3000, spent: 0 },
    { name: "Decorations", allocated: 1500, spent: 0 },
    { name: "Entertainment", allocated: 2000, spent: 0 },
    { name: "Miscellaneous", allocated: 1000, spent: 0 },
  ])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: "", amount: "" })

  // Calculate total budget across all teams
  useEffect(() => {
    const total = teams.reduce((sum, team) => sum + (team.budget?.total || 0), 0)
    const current = teams.reduce((sum, team) => sum + (team.budget?.current || 0), 0)

    setTotalBudget(total)
    setCurrentBudget(current)
  }, [teams])

  const handleEditBudget = () => {
    if (selectedTeam) {
      const current = Number.parseFloat(newBudget.current) || 0
      const total = Number.parseFloat(newBudget.total) || 0

      updateTeamBudget(selectedTeam, current, total)
      setIsEditBudgetOpen(false)
    }
  }

  const handleAddExpense = () => {
    const updatedCategories = budgetCategories.map((category) => {
      if (category.name === newExpense.category) {
        return { ...category, spent: category.spent + Number.parseFloat(newExpense.amount) }
      }
      return category
    })
    setBudgetCategories(updatedCategories)
    setIsAddExpenseOpen(false)
    setNewExpense({ category: "", amount: "" })
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Budget Tracker</h1>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Overall Budget</h2>
          <Button
            onClick={() => {
              setSelectedTeam(teams[0]?.id || null)
              setNewBudget({
                current: teams[0]?.budget?.current.toString() || "0",
                total: teams[0]?.budget?.total.toString() || "0",
              })
              setIsEditBudgetOpen(true)
            }}
          >
            Edit Budget
          </Button>
        </div>
        <div className="flex justify-between mb-2">
          <span>Total Budget: {formatCurrency(totalBudget)}</span>
          <span>Spent: {formatCurrency(currentBudget)}</span>
        </div>
        <Progress value={totalBudget > 0 ? (currentBudget / totalBudget) * 100 : 0} className="w-full" />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={teams.map((team) => ({
                  name: team.name,
                  value: team.budget?.total || 0,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {teams.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Budgets</h3>
          {teams.map((team) => (
            <div key={team.id} className="mb-4">
              <div className="flex justify-between mb-2">
                <span>{team.name}</span>
                <span>
                  {formatCurrency(team.budget?.current || 0)} / {formatCurrency(team.budget?.total || 0)}
                </span>
              </div>
              <Progress
                value={team.budget?.total ? (team.budget.current / team.budget.total) * 100 : 0}
                className="w-full"
              />
              <div className="mt-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTeam(team.id)
                    setNewBudget({
                      current: (team.budget?.current || 0).toString(),
                      total: (team.budget?.total || 0).toString(),
                    })
                    setIsEditBudgetOpen(true)
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={() => setIsAddExpenseOpen(true)} className="w-full mt-4">
            Add Expense
          </Button>
        </Card>
      </div>

      <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-select">Team</Label>
              <select
                id="team-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTeam || ""}
                onChange={(e) => {
                  const teamId = e.target.value
                  setSelectedTeam(teamId)
                  const team = teams.find((t) => t.id === teamId)
                  if (team) {
                    setNewBudget({
                      current: (team.budget?.current || 0).toString(),
                      total: (team.budget?.total || 0).toString(),
                    })
                  }
                }}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-budget">Current Budget ($)</Label>
                <Input
                  id="current-budget"
                  type="number"
                  value={newBudget.current}
                  onChange={(e) => setNewBudget({ ...newBudget, current: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total-budget">Total Budget ($)</Label>
                <Input
                  id="total-budget"
                  type="number"
                  value={newBudget.total}
                  onChange={(e) => setNewBudget({ ...newBudget, total: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBudgetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget}>Save Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expense-team">Team</Label>
              <select
                id="expense-team"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-category">Category</Label>
              <select
                id="expense-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {budgetCategories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

