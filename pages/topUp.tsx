// ==================== FRONTEND - pages/user/TopUp.tsx ====================

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';
import api from '../services/api';
import { formatCurrency } from '../services/api';
import {
  DollarSign,
  Loader2,
  Upload,
  Copy,
  Check,
  ArrowUpCircle,
  AlertCircle,
  Clock,
  X as XIcon
} from 'lucide-react';
import { useToast } from '../components/Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface DepositSettings {
  cryptoAddress: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Deposit {
  id: number;
  amount: number;
  method: string;
  receiptImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  rejectionReason?: string;
}

export const TopUp = () => {
  const [step, setStep] = useState<'method' | 'payment' | 'receipt'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | null>(null);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<DepositSettings | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchDeposits();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getDepositSettings();
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to fetch deposit settings', err);
      showToast('Failed to load deposit settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      const data = await api.getUserDeposits();
      setDeposits(data.deposits || []);
    } catch (err) {
      console.error('Failed to fetch deposits', err);
    }
  };

  const handleMethodSelect = (method: 'crypto' | 'bank') => {
    setSelectedMethod(method);
    setStep('payment');
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) < 100) {
      showToast('Minimum deposit amount is ₦100', 'error');
      return;
    }
    setStep('receipt');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Only image files (JPEG, PNG, GIF) are allowed', 'error');
      return;
    }

    setReceipt(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!receipt || !amount || !selectedMethod) {
      showToast('Please complete all fields', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('receipt', receipt);
      formData.append('amount', amount);
      formData.append('method', selectedMethod);

      await api.createDepositRequest(formData);

      showToast('Deposit request submitted successfully!', 'success');
      
      // Reset form
      setStep('method');
      setSelectedMethod(null);
      setAmount('');
      setReceipt(null);
      setReceiptPreview(null);
      
      // Refresh deposits list
      await fetchDeposits();
    } catch (err: any) {
      showToast(err?.payload?.message || 'Failed to submit deposit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
  };

  const handleReset = () => {
    setStep('method');
    setSelectedMethod(null);
    setAmount('');
    setReceipt(null);
    setReceiptPreview(null);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowUpCircle className="text-violet-600" />
          Top Up Wallet
        </h2>
        <p className="text-slate-500">Add funds to your wallet via crypto or bank transfer</p>
      </div>

      {/* Deposit Form */}
      <Card className="p-6">
        {/* Step 1: Method Selection */}
        {step === 'method' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleMethodSelect('crypto')}
                className="p-6 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200">
                    <DollarSign className="text-violet-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Cryptocurrency</h4>
                    <p className="text-sm text-slate-500">USDT (TRC20)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">Fast and secure crypto payment</p>
              </button>

              <button
                onClick={() => handleMethodSelect('bank')}
                className="p-6 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Bank Transfer</h4>
                    <p className="text-sm text-slate-500">Local bank transfer</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">Transfer from any Nigerian bank</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 'payment' && settings && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedMethod === 'crypto' ? 'Crypto Payment Details' : 'Bank Transfer Details'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Change Method
              </Button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount to Deposit
              </label>
              <Input
                type="number"
                placeholder="Enter amount (minimum ₦100)"
                value={amount}
                onChange={(e: any) => setAmount(e.target.value)}
                min="100"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum: ₦100</p>
            </div>

            {/* Payment Instructions */}
            <Card className="bg-slate-50 p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle size={18} className="text-violet-600" />
                Payment Instructions
              </h4>

              {selectedMethod === 'crypto' ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">
                    Send USDT (TRC20) to the address below:
                  </p>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <div className="flex justify-between items-center">
                      <code className="text-sm font-mono break-all text-slate-900">
                        {settings.cryptoAddress || 'Not configured'}
                      </code>
                      {settings.cryptoAddress && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(settings.cryptoAddress, 'crypto')}
                        >
                          {copiedField === 'crypto' ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700 mb-3">
                    Transfer to the bank account below:
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white p-2 rounded border">
                      <div>
                        <span className="text-xs text-slate-500">Bank Name</span>
                        <p className="font-semibold text-slate-900">{settings.bankName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(settings.bankName, 'bank')}
                      >
                        {copiedField === 'bank' ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border">
                      <div>
                        <span className="text-xs text-slate-500">Account Number</span>
                        <p className="font-semibold text-slate-900">{settings.accountNumber}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(settings.accountNumber, 'account')}
                      >
                        {copiedField === 'account' ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border">
                      <div>
                        <span className="text-xs text-slate-500">Account Name</span>
                        <p className="font-semibold text-slate-900">{settings.accountName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(settings.accountName, 'name')}
                      >
                        {copiedField === 'name' ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> After making payment, upload your receipt on the next step. 
                  Your wallet will be credited after admin verification (usually within 24 hours).
                </p>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleAmountSubmit} disabled={!amount || parseFloat(amount) < 100}>
                Continue to Upload Receipt
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Receipt */}
        {step === 'receipt' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Upload Payment Receipt</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>
                Back
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700">
                <strong>Amount:</strong> {formatCurrency(parseFloat(amount))}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Method:</strong> {selectedMethod === 'crypto' ? 'Cryptocurrency (USDT)' : 'Bank Transfer'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Receipt
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-violet-500 transition-colors">
                {receiptPreview ? (
                  <div className="space-y-4">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReceipt(null);
                        setReceiptPreview(null);
                      }}
                    >
                      <XIcon size={16} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-slate-400 mb-3" size={48} />
                    <label className="cursor-pointer">
                      <span className="text-violet-600 hover:text-violet-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-slate-500"> or drag and drop</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!receipt || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Submitting...
                  </>
                ) : (
                  'Submit Deposit Request'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <Card>
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Deposit History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Method</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">#{deposit.id}</td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(deposit.amount)}</td>
                    <td className="px-6 py-4 capitalize">{deposit.method}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(deposit.createdAt)}</td>
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
                      {deposit.status === 'REJECTED' && deposit.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{deposit.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getImageUrl(deposit.receiptImage)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 hover:underline text-xs flex items-center gap-1"
                      >
                        View <Upload size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};