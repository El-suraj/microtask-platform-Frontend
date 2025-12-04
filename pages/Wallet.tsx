import React, { useState, useEffect } from "react";
import { Card, Button, Input, Badge } from "../components/ui";
import { formatCurrency } from "../services/store";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  History,
  Loader2,
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
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState<any>({ walletBalance: 0 });

  // controlled inputs for amount fields
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
  const [depositAmount, setDepositAmount] = useState<number | "">("");

  // new: payment details for withdrawal
  const [method, setMethod] = useState<string>("");
  const [bankName, setBankName] = useState<string>(""); // used for Bank Transfer: bank name
  const [accountNumber, setAccountNumber] = useState<string>(""); // account number / wallet / paypal email
  const [accountName, setAccountName] = useState<string>(""); // account holder name

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        // get current logged-in user
        const me = await api.getMe();
        const current = me.user || me;
        setUser(current);

        // wallet and transactions
        const walletRes = await api.getMyWallet();
        setWallet(walletRes || { walletBalance: 0 });

        // fix: api.getTransactions() has no id param
        const txData = await api.getTransactions();
        setTransactions(
          Array.isArray(txData) ? txData : txData.transactions || []
        );
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUser();
  }, []);

  // simple id generator for local mock transactions
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // mock API: simulate network + response for deposit
  const simulateDepositApi = async (amount: number) => {
    return new Promise<{ success: boolean; transaction?: any }>((resolve) => {
      setTimeout(() => {
        const tx = {
          id: genId(),
          type: "DEPOSIT",
          date: new Date().toLocaleString(),
          status: "COMPLETED",
          amount: Math.abs(amount),
        };
        resolve({ success: true, transaction: tx });
      }, 900);
    });
  };

  const addTransactionLocally = (tx: any) => {
    setTransactions((prev: any[]) => [tx, ...prev]);
  };

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
      const res = await simulateDepositApi(amt);
      if (res.success && res.transaction) {
        setWallet((w: any) => ({
          ...w,
          walletBalance: Number((w.walletBalance || 0) + amt),
        }));
        addTransactionLocally(res.transaction);
        showToast("Deposit successful", "success");
        setDepositModalOpen(false);
        setDepositAmount("");
      } else {
        showToast("Deposit failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Deposit failed", "error");
    } finally {
      setProcessing(false);
    }
  };

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
                onClick={() => setDepositModalOpen(true)}
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
                  <td className="px-6 py-4 text-slate-500">{tx.date}</td>
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
                    className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? "text-primary-600" : "text-slate-900"
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
                    {bankName && <p className="text-xs text-green-600 mt-2">✓ Using saved bank details from your profile</p>}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Make a Deposit</h3>
            <p className="text-sm text-slate-500 mb-6">
              Deposits are reflected immediately in your wallet.
            </p>

            <div className="space-y-4 mb-6">
              <Input
                label="Amount (NGN)"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e: any) =>
                  setDepositAmount(
                    e?.target?.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500">
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Crypto (USDT)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDepositModalOpen(false);
                  setDepositAmount("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleDeposit} disabled={processing}>
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
    </div>
  );
};
