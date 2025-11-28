import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/ui';
// import { formatCurrency, MOCK_USER, MOCK_TRANSACTIONS } from '../services/store';
import { ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, History, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '../components/Toast';

const data = [
  { name: 'Mon', amt: 12 },
  { name: 'Tue', amt: 19 },
  { name: 'Wed', amt: 3 },
  { name: 'Thu', amt: 5 },
  { name: 'Fri', amt: 2 },
  { name: 'Sat', amt: 25 },
  { name: 'Sun', amt: 15 },
];

export const Wallet = () => {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const handleWithdraw = () => {
    setProcessing(true);
    // Simulate API
    setTimeout(() => {
        setProcessing(false);
        setWithdrawModalOpen(false);
        showToast("Withdrawal request submitted successfully!", "success");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 p-8 bg-primary-900 text-white border-none flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary-900/20">
          <div className="relative z-10">
            <p className="text-primary-200 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-6">{formatCurrency(MOCK_USER.balance)}</h2>
            <div className="flex gap-3">
              <Button onClick={() => setWithdrawModalOpen(true)} className="bg-white text-primary-900 hover:bg-slate-100 border-none shadow-none">
                <ArrowUpRight size={18} className="mr-2" /> Withdraw
              </Button>
              <Button variant="outline" className="border-primary-700 text-white hover:bg-primary-800 hover:text-white bg-transparent">
                <ArrowDownLeft size={18} className="mr-2" /> Deposit
              </Button>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none"></div>
          <WalletIcon className="absolute bottom-4 right-4 text-primary-800 w-32 h-32 opacity-20" />
        </Card>

        <Card className="p-6 flex flex-col justify-center">
            <h3 className="font-semibold text-slate-900 mb-4">Earnings this Week</h3>
            <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="amt" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 5 ? '#0a6f37' : '#e2e8f0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">Highest earning day: Saturday</p>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-slate-500" /> Transaction History
            </h3>
            <Button variant="ghost" size="sm">Download CSV</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {MOCK_TRANSACTIONS.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900 capitalize">{tx.type.toLowerCase()}</td>
                            <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                            <td className="px-6 py-4">
                                <Badge color={tx.status === 'COMPLETED' ? 'green' : 'yellow'}>{tx.status}</Badge>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-primary-600' : 'text-slate-900'}`}>
                                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      {/* Withdraw Modal Mockup */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>
                <p className="text-sm text-slate-500 mb-6">Withdrawals are processed within 24 hours to your preferred payment method.</p>
                
                <div className="space-y-4 mb-6">
                    <Input label="Amount (NGN)" type="number" placeholder="0.00" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                        <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500">
                            <option>PayPal</option>
                            <option>Bank Transfer</option>
                            <option>Crypto (USDT)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={() => setWithdrawModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleWithdraw} disabled={processing}>
                        {processing ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Processing...</span> : "Confirm"}
                    </Button>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};