import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Input } from '../components/ui';
import { Search, Filter, Clock, Users } from 'lucide-react';
import api from '../services/api'
import { formatCurrency } from '../services/api';


export const Tasks = () => {
  const [filter, setFilter] = useState('');
  const [task, setTask] = useState<any[]>([]);

  const filteredTasks = task.filter(t => 
    t.title.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );
  async function fetchTasks() {
    try {
      const taskres = await api.listTasks();
      setTask(taskres);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  React.useEffect(() => {
    fetchTasks();
  }, []);
  // Format date helper
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso.trim()).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search tasks by name or category..." 
            className="pl-10 focus:border-primary-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Filter size={18} /> Filters
        </Button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="flex flex-col h-full hover:shadow-md transition-shadow group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <Badge color="primary">{task.category}</Badge>
                <span className="font-bold text-lg text-slate-900">{formatCurrency(task.reward)}</span>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">{task.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">{task.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-primary-600" />
                  {formatDate(task.deadline) || 'No Deadline'}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-primary-600" />
                  {task.remainingSlots}/{task.totalSlots} Slots Left
                </div>
                <div className="flex items-center gap-1">
                   <span className={`w-2 h-2 rounded-full ${
                     task.difficulty === 'Easy' ? 'bg-green-500' : 
                     task.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                   }`}></span>
                   {task.difficulty}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
              <Link to={`/tasks/${task.id}`} className="block w-full">
                <Button className="w-full">Start Task</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};