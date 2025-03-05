"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface BudgetCategory {
  name: string
  allocated: number
  spent: number
}

export default function BudgetPage() {
  const [totalBudget, setTotalBudget] = useState(15000)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [newBudget, setNewBudget] = useState(totalBudget.toString())

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { name: "Venue", allocated: 5000, spent: 0 },
    { name: "Catering", allocated: 3000, spent: 0 },
    { name: "Decorations", allocated: 1500, spent: 0 },
    { name: "Entertainment", allocated: 2000, spent: 0 },
    { name: "Miscellaneous", allocated: 1000, spent: 0 },
  ])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: "", amount: "" })

  const totalSpent = budgetCategories.reduce((sum, category) => sum + category.spent, 0)

  const handleEditBudget = () => {
    const updatedBudget = Number.parseFloat(newBudget)
    if (!isNaN(updatedBudget) && updatedBudget > 0) {
      setTotalBudget(updatedBudget)
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Budget Tracker</h1>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Overall Budget</h2>
          <Button onClick={() => setIsEditBudgetOpen(true)}>Edit Budget</Button>
        </div>
        <div className="flex justify-between mb-2">
          <span>Total Budget: ${totalBudget}</span>
          <span>Spent: ${totalSpent}</span>
        </div>
        <Progress value={(totalSpent / totalBudget) * 100} className="w-full" />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="allocated"
              >
                {budgetCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          {budgetCategories.map((category) => (
            <div key={category.name} className="mb-4">
              <div className="flex justify-between mb-2">
                <span>{category.name}</span>
                <span>
                  ${category.spent} / ${category.allocated}
                </span>
              </div>
              <Progress value={(category.spent / category.allocated) * 100} className="w-full" />
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
            <DialogTitle>Edit Total Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="total-budget" className="text-right">
                Total Budget
              </Label>
              <Input
                id="total-budget"
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleEditBudget}>Save Budget</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expense-category" className="text-right">
                Category
              </Label>
              <select
                id="expense-category"
                className="col-span-3"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expense-amount" className="text-right">
                Amount
              </Label>
              <Input
                id="expense-amount"
                type="number"
                className="col-span-3"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddExpense}>Save Expense</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

