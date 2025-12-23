import React, { useState, useEffect } from "react";
import { Card, Button, Input, Badge } from "../components/ui";
import { formatCurrency } from "../services/api";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  History,
  DollarSign,
  Loader2,
  Upload,
  Copy,
  Check,
  ArrowUpCircle,
  AlertCircle,
  Clock,
  X as XIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useToast } from "../components/Toast";
import api from "../services/api";
import { DepositSettings,Deposit } from "@/types";

const data = [
  { name: "Mon", amt: 12 },
  { name: "Tue", amt: 19 },
  { name: "Wed", amt: 3 },
  { name: "Thu", amt: 5 },
  { name: "Fri", amt: 2 },
  { name: "Sat", amt: 25 },
  { name: "Sun", amt: 15 },
];

export const Wallet = () => {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState<any>({ walletBalance: 0 });
  const [settings, setSettings] = useState<DepositSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [step, setStep] = useState<'method' | 'payment' | 'receipt'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'bank' | null>(null);
  // controlled inputs for amount fields
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);  
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  // new: payment details for withdrawal
  const [method, setMethod] = useState<string>("");
  const [bankName, setBankName] = useState<string>(""); // used for Bank Transfer: bank name
  const [accountNumber, setAccountNumber] = useState<string>(""); // account number / wallet / paypal email
  const [accountName, setAccountName] = useState<string>(""); // account holder name
   const [submitting, setSubmitting] = useState(false);


    const fetchUser = async () => {
      try {
        // get current logged-in user
        const me = await api.getMe();
        const current = (me as any)?.user ?? me;
        setUser(current);

        // wallet and transactions
        let walletRes: any = null;
        try {
          walletRes = await api.getMyWallet();
          console.log("Wallet API Response (Wallet.tsx):", walletRes);
          // Handle different response formats
          if (Array.isArray(walletRes)) {
            walletRes = walletRes[0];
          } else if (walletRes?.wallet) {
            walletRes = walletRes.wallet;
          } else if (walletRes?.data) {
            walletRes = walletRes.data;
          }
          console.log("Normalized Wallet (Wallet.tsx):", walletRes);
        } catch (walletErr) {
          console.warn("Failed to fetch wallet:", walletErr);
          walletRes = { walletBalance: 0 };
        }
        setWallet(walletRes || { walletBalance: 0 });

        // Fetch all transactions for the user (includes deposits, withdrawals, etc)
        let txData: any[] = [];
        try {
          // Try to get all transactions
          const allTx = await api.getTransactions();
          console.log("Transactions API Response:", allTx);

          // Handle different response formats
          if (Array.isArray(allTx)) {
            txData = allTx;
          } else if (allTx?.transactions) {
            txData = allTx.transactions;
          } else if (allTx?.data) {
            txData = allTx.data;
          } else {
            txData = [];
          }

          console.log("Normalized Transactions Count:", txData.length);
          console.log("Normalized Transactions:", txData);

          // Log transaction types for debugging
          const txTypes = txData.map((tx) => tx.type).filter(Boolean);
          console.log("Transaction Types Found:", [...new Set(txTypes)]);
        } catch (txErr) {
          console.warn("Failed to fetch transactions:", txErr);
          txData = [];
        }

        // Sort transactions by date (newest first)
        txData = txData.map((tx) => ({
          ...tx,
          type: tx.type?.toUpperCase() ?? "",
          status: tx.status?.toUpperCase() ?? "",
          method: tx.method ?? tx.bankName ?? "—",
          amount: Number(tx.amount ?? 0),
          date: tx.createdAt
            ? new Date(tx.createdAt).toLocaleString()
           : tx.date ?? "",
        }));

        setTransactions(txData);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
   

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


useEffect(() => {
      setMounted(true);

      const init = async () => {
        await Promise.all([
          fetchUser(),
          fetchSettings(),
          fetchDeposits()
        ]);
  };

  init();
}, []);

  // simple id generator for local mock transactions
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // mock API: simulate network + response for deposit
  

  // const addTransactionLocally = (tx: any) => {
  //   setTransactions((prev: any[]) => [tx, ...prev]);
  // };

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount || 0);
    if (!amt || amt <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    if (amt > (wallet.walletBalance || 0)) {
      showToast("Insufficient balance", "error");
      return;
    }
    if (!method) {
      showToast("Select a payment method", "error");
      return;
    }

    // method-specific validations
    if (method === "Bank Transfer") {
      if (!bankName || !accountNumber) {
        showToast("Provide bank name and account number", "error");
        return;
      }
    } else if (method === "PayPal") {
      if (!accountNumber) {
        showToast("Provide PayPal email address", "error");
        return;
      }
    } else if (method === "Crypto (EVM)") {
      if (!accountNumber) {
        showToast("Provide wallet address", "error");
        return;
      }
    }

    setProcessing(true);
    try {
      // normalize payload to backend fields: bankName and accountNumber
      // send method as bankName when not a bank transfer to indicate method type
      const payloadBankName = method === "Bank Transfer" ? bankName : method;
      const payloadAccount = accountNumber;

      const res = await api.requestWithdrawal(
        amt,
        payloadBankName,
        payloadAccount
      );
      const withdrawal = (res as any)?.withdrawal;

      // create local pending transaction entry (do NOT deduct balance until admin approves)
      const tx = {
        id: withdrawal?.id ?? genId(),
        type: "WITHDRAWAL",
        method: method,
        date: withdrawal?.createdAt
          ? new Date(withdrawal.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        status: (withdrawal?.status ?? "PENDING").toString().toUpperCase(),
        amount: -Math.abs(amt),
      };
      addTransactionLocally(tx);

      showToast("Withdrawal requested — awaiting admin approval", "success");
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setMethod("");
    } catch (err: any) {
      console.error(err);
      showToast(err?.payload?.message ?? "Withdrawal request failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async () => {
    const amt = Number(depositAmount || 0);
    if (!amt || amt <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    setProcessing(true);
    try {
      const res = await api.topUpWallet(amt, "Deposit");
      const tx = res.transaction;

      // addTransactionLocally(
      // {
      //     id: tx.id,
      //     type: "DEPOSIT",
      //     method: tx.method,
      //     date: new Date(tx.createdAt).toLocaleString(),
      //     status: tx.status.toUpperCase(),
      //     amount: tx.amount,
      //   });

        
        showToast("Deposit Requested", "success");
        setDepositModalOpen(false);
        setDepositAmount("");
      } catch (err:any) {
        showToast(err?.payload?.message ||"Deposit failed", "error");
    } finally {
      setProcessing(false);
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

   // Format date helper
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso.trim()).toLocaleString();
    } catch {
      return iso;
    }
  };
  const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_BASE_URL}${path}`;
};

   if (loading) {
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-violet-600" size={32} />
        </div>
      );
    }


  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 p-8 bg-primary-900 text-white border-none flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary-900/20">
          <div className="relative z-10">
            <p className="text-primary-200 font-medium mb-1">
              Available Balance
            </p>
            <h2 className="text-4xl font-bold mb-6">
              {formatCurrency(wallet.walletBalance || 0)}
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={() => setWithdrawModalOpen(true)}
                className="bg-white text-primary-900 hover:bg-slate-100 border-none shadow-none"
              >
                <ArrowUpRight size={18} className="mr-2" /> Withdraw
              </Button>
              <Button
                onClick={() => setDepositModalOpen(true) }
                variant="outline"
                className="border-primary-700 text-white hover:bg-primary-800 hover:text-white bg-transparent"
              >
                <ArrowDownLeft size={18} className="mr-2" /> Deposit
              </Button>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none"></div>
          <WalletIcon className="absolute bottom-4 right-4 text-primary-800 w-32 h-32 opacity-20" />
        </Card>

        <Card className="p-6 flex flex-col justify-center">
          <h3 className="font-semibold text-slate-900 mb-4">
            Earnings this Week
          </h3>
          <div className="h-32 min-h-[64px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar dataKey="amt" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 5 ? "#0a6f37" : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%" }} />
            )}
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            Highest earning day: Saturday
          </p>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History size={20} className="text-slate-500" /> Transaction History
          </h3>
          <Button variant="ghost" size="sm">
            Download CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900 capitalize">
                    {tx.type.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {tx.method ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      color={tx.status === "COMPLETED" ? "green" : "yellow"}
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-bold ${
                      tx.amount > 0 ? "text-primary-600" : "text-slate-900"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
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
            <p className="text-sm text-slate-500 mb-6">
              Withdrawals are processed by admins — requests stay pending until
              approved.
            </p>

            <div className="space-y-4 mb-6">
              <Input
                label="Amount (NGN)"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e: any) =>
                  setWithdrawAmount(
                    e?.target?.value === "" ? "" : Number(e.target.value)
                  )
                }
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 mb-3"
                  onChange={(e) => setMethod(e.target.value)}
                  value={method}
                >
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Crypto (EVM)">Crypto (EVM)</option>
                </select>

                {/* Conditional fields */}
                {method === "Bank Transfer" && (
                  <>
                    <Input
                      label="Bank Name"
                      placeholder="e.g. First Bank"
                      value={bankName}
                      onChange={(e: any) => setBankName(e.target.value)}
                    />
                    <Input
                      label="Account Name"
                      placeholder="Account holder name"
                      value={accountName}
                      onChange={(e: any) => setAccountName(e.target.value)}
                    />
                    <Input
                      label="Account Number"
                      placeholder="Account number"
                      value={accountNumber}
                      onChange={(e: any) => setAccountNumber(e.target.value)}
                    />
                    {bankName && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Using saved bank details from your profile
                      </p>
                    )}
                  </>
                )}

                {method === "PayPal" && (
                  <Input
                    label="PayPal Email"
                    placeholder="paypal@example.com"
                    value={accountNumber}
                    onChange={(e: any) => setAccountNumber(e.target.value)}
                  />
                )}

                {method === "Crypto (EVM)" && (
                  <Input
                    label="Wallet Address (EVM)"
                    placeholder="0x..."
                    value={accountNumber}
                    onChange={(e: any) => setAccountNumber(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setWithdrawModalOpen(false);
                  setWithdrawAmount("");
                  setBankName("");
                  setAccountNumber("");
                  setMethod("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleWithdraw} disabled={processing}>
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Processing...
                  </span>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Deposit Modal Mockup */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl p-6 animate-in fade-in zoom-in duration-200">
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
            </Card>
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
              <Button variant="outline" onClick={
                setDepositModalOpen(false)
                }>
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
              <Button
                  type="button"
                  onClick={handleAmountSubmit}
                  disabled={!amount || parseFloat(amount) < 100}
                >
                 Continue to Upload Receipt
              </Button>
            </div>
          </Card>
        </div>  
        )}
       

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
      )}

