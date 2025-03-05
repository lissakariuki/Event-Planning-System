import Link from "next/link"
import { Home, DollarSign, Users, Calendar, MessageCircle, CheckSquare, Music } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-full shadow-md">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">EPS</h1>
      </div>
      <nav className="mt-8">
        <Link
          href="/"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Home className="mr-2" size={20} />
          Dashboard
        </Link>
        <Link
          href="/events"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Music className="mr-2" size={20} />
          Events
        </Link>
        <Link
          href="/budget"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <DollarSign className="mr-2" size={20} />
          Budget
        </Link>
        <Link
          href="/vendors"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Users className="mr-2" size={20} />
          Vendors
        </Link>
        <Link
          href="/guests"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Users className="mr-2" size={20} />
          Guests
        </Link>
        <Link
          href="/calendar"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <Calendar className="mr-2" size={20} />
          Calendar
        </Link>
        <Link
          href="/tasks"
          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <CheckSquare className="mr-2" size={20} />
          Tasks
        </Link>
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md flex items-center justify-center">
          <MessageCircle className="mr-2" size={20} />
          Chat Assistant
        </button>
      </div>
    </div>
  )
}

