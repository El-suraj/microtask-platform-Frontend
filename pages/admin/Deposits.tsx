import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, StatCard, Input } from '../../components/ui';
import api from "../../services/api";
import { formatCurrency } from '../../services/api';
import { Deposit, DepositSettings } from '@/types';

import { Check, X, Loader2, DollarSign, Clock, Settings, Save, ArrowDownCircle } from 'lucide-react';
import { useToast } from '../../components/Toast';

export const AdminDeposits = () => {
 const [activeTab, setActiveTab] =
  useState<'requests' | 'settings'>('requests');

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  

  const [loading, setLoading] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showToast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<any[]>([]);
  const [settings, setSettings] = useState<DepositSettings>({
  cryptoAddress: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
});

    
    useEffect(() => {
    fetchDeposits();
    fetchAccounts();
    fetchSettings();
  }, []);

    const fetchDeposits = async () => {
    try {
      const data = await api.adminGetDeposits();
      setDeposits(data.deposits || []);
    } catch (err) {
      console.error("Failed to fetch deposits", err);
      showToast("Failed to load deposits", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchAccounts = async () => {
  const banks = await api.adminGetBankAccounts();
  const crypto = await api.adminGetCryptoAddresses();
  setBankAccounts(banks);
  setCryptoAddresses(crypto);
};
const fetchSettings = async () => {
  try {
    setLoadingSettings(true);
    const res = await api.adminGetDepositSettings();
    if (res?.settings) {
      setSettings(res.settings);
    }
  } catch (e) {
    showToast("Failed to load deposit settings", "error");
  } finally {
    setLoadingSettings(false);
  }
};
  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      if (action === 'approve') {
        await api.adminApproveDeposit(id);
        showToast("Deposit approved and wallet credited", "success");
      } else {
        await api.adminRejectDeposit(id);
        showToast("Deposit rejected", "success");
      }

      // Refresh deposits
      await fetchDeposits();
    } catch (e: any) {
      showToast(e?.payload?.message || "Action failed", "error");
    } finally {
      setProcessingId(null);
    }
  };
const handleSaveSettings = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setSavingSettings(true);

    await api.adminUpdateDepositSettings({
      cryptoAddress: settings.cryptoAddress,
      bankName: settings.bankName,
      accountNumber: settings.accountNumber,
      accountName: settings.accountName,
    });

    showToast("Deposit settings updated successfully", "success");
  } catch (error) {
    console.error("Failed to save deposit settings", error);
    showToast("Failed to save settings", "error");
  } finally {
    setSavingSettings(false);
  }
};


    const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };
  
    // Helper: format ISO date
    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        try {
            return new Date(iso.trim()).toLocaleString();
        } catch {
            return iso;
        }
    };
   


    // Stats
  const pendingDeposits = deposits.filter(d => d.status === 'PENDING');
  const approvedDeposits = deposits.filter(d => d.status === 'APPROVED');
  const totalPendingAmount = pendingDeposits.reduce((acc, d) => acc + d.amount, 0);
  const totalApprovedAmount = approvedDeposits.reduce((acc, d) => acc + d.amount, 0);
    
  
  if (loading) 
        return 
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-violet-600" />
        </div>;

 return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownCircle className="text-violet-600" />
            Deposits Management
          </h2>
          <p className="text-slate-500">Manage user deposits and payment settings.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Pending Amount"
              value={formatCurrency(totalPendingAmount)}
              icon={<Clock size={20} />}
              color="yellow"
            />
            <StatCard
              title="Pending Count"
              value={pendingDeposits.length.toString()}
              icon={<Clock size={20} />}
              color="yellow"
            />
            <StatCard
              title="Approved Amount"
              value={formatCurrency(totalApprovedAmount)}
              icon={<Check size={20} />}
              color="green"
            />
            <StatCard
              title="Total Requests"
              value={deposits.length.toString()}
              icon={<DollarSign size={20} />}
            />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Receipt</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No deposit requests found
                      </td>
                    </tr>
                  ) : (
                    deposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-slate-500 font-bold">
                          #{deposit.id}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900">
                              {deposit.user?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-slate-400">
                              ID: {deposit.userId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {formatCurrency(deposit.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize">{deposit.method}</span>
                        </td>
                        <td className="px-6 py-4">
                          {deposit.receiptImage ? (
                            <button
                              onClick={() => setPreviewImage(getImageUrl(deposit.receiptImage))}
                              className="text-violet-600 hover:underline flex items-center gap-1"
                            >
                              View <ExternalLink size={12} />
                            </button>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {formatDate(deposit.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            color={
                              deposit.status === 'APPROVED'
                                ? 'green'
                                : deposit.status === 'REJECTED'
                                ? 'red'
                                : 'yellow'
                            }
                          >
                            {deposit.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deposit.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => handleAction(deposit.id, 'reject')}
                                disabled={processingId === deposit.id}
                              >
                                {processingId === deposit.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <X size={16} />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction(deposit.id, 'approve')}
                                disabled={processingId === deposit.id}
                              >
                                {processingId === deposit.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={16} />
                                )}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-violet-600" size={20} />
              Crypto Payment Settings
            </h3>
            {loadingSettings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-violet-600" />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <Input
                  label="USDT (TRC20) Wallet Address"
                  placeholder="Enter wallet address"
                  value={settings.cryptoAddress}
                  onChange={(e: any) =>
                    setSettings({ ...settings, cryptoAddress: e.target.value })
                  }
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Crypto Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings className="text-violet-600" size={20} />
              Bank Transfer Settings
            </h3>
            {loadingSettings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-violet-600" />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <Input
                  label="Bank Name"
                  placeholder="e.g. First Bank"
                  value={settings.bankName}
                  onChange={(e: any) =>
                    setSettings({ ...settings, bankName: e.target.value })
                  }
                />
                <Input
                  label="Account Number"
                  placeholder="1234567890"
                  value={settings.accountNumber}
                  onChange={(e: any) =>
                    setSettings({ ...settings, accountNumber: e.target.value })
                  }
                />
                <Input
                  label="Account Name"
                  placeholder="DCTV Earn Corp"
                  value={settings.accountName}
                  onChange={(e: any) =>
                    setSettings({ ...settings, accountName: e.target.value })
                  }
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Bank Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-semibold text-slate-900">Payment Receipt</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewImage, '_blank')}
                  className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 rounded-md flex items-center gap-1.5"
                >
                  <ExternalLink size={16} />
                  Open
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-100 max-h-[calc(90vh-80px)] overflow-auto">
              <img
                src={previewImage}
                alt="Payment receipt"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={() => {
                  showToast("Failed to load receipt image", "error");
                  setPreviewImage(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
