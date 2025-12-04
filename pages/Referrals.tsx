
import React from 'react';
import { Card, Button, Input, StatCard } from '../components/ui';
import { Users, Copy, Gift, Award } from 'lucide-react';

export const Referrals = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-violet-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">Invite Friends, Earn Cash</h1>
          <p className="text-violet-100 text-lg mb-8">
            Earn ₦5,000 for every friend who joins DCTV Earn and completes their first 3 tasks. There is no limit to how much you can earn!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md">
             <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-1 flex items-center">
                <span className="px-3 text-sm text-white/70 truncate">dctv.earn/ref/elsuraj</span>
             </div>
             <Button variant="secondary" className="bg-white text-violet-600 hover:bg-violet-50 whitespace-nowrap">
                <Copy size={16} className="mr-2" /> Copy Link
             </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent"></div>
        <Users className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Referrals" value="12" icon={<Users size={20} />} />
        <StatCard title="Active Users" value="8" icon={<Award size={20} />} trend="66% conversion" />
        <StatCard title="Earnings" value="₦45,000" icon={<Gift size={20} />} />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Referral History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Amina Bello</td>
                <td className="px-6 py-4 text-slate-500">Oct 24, 2023</td>
                <td className="px-6 py-4"><span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full text-xs">Completed</span></td>
                <td className="px-6 py-4 text-right font-medium">₦5,000</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Chinedu Eze</td>
                <td className="px-6 py-4 text-slate-500">Oct 22, 2023</td>
                <td className="px-6 py-4"><span className="text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded-full text-xs">Pending (1/3 Tasks)</span></td>
                <td className="px-6 py-4 text-right text-slate-400">₦0</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Ngozi Obi</td>
                <td className="px-6 py-4 text-slate-500">Oct 20, 2023</td>
                <td className="px-6 py-4"><span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full text-xs">Completed</span></td>
                <td className="px-6 py-4 text-right font-medium">₦5,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
