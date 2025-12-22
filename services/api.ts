// services/api.ts - Unified TypeScript API client

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone?: string;
    walletBalance: number;
    role: string;
    status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
    walletStatus?: 'ACTIVE' | 'FROZEN';
    createdAt: string;
    banReason?: string;
    bannedAt?: string;
    suspendedUntil?: string;
    walletFreezeReason?: string;
    walletFrozenAt?: string;
}

export type Deposit = {
  id: number;
  userId: number;
  amount: number;
  method: string;
  status: string;
  createdAt?: string;
};

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  link?: string | null;
  reward?: number;
  deadline?: string | null;
  totalSlots?: number;
  remainingSlots?: number;
  proofType?: string | null;
  userId?: number;
  escrowAmount?: number;
  createdAt?: string;
  user?: User;
};

export type Submission = {
  id: number;
  userId: number;
  taskId: number;
  proofImage?: string | null;
  proofText?: string | null;
  status?: string;
  reviewedBy?: number | null;
  createdAt?: string;
};

export type Appeal = {
  id: number;
  submissionId: number;
  userId: number;
  message: string;
  status?: string;
  adminDecision?: string | null;
  adminNote?: string | null;
  createdAt?: string;
};

export type BankDetail = {
  id: number;
  bankName: string;
  accountNumberMasked: string;
  accountHolder?: string;
  isPrimary: boolean;
  createdAt?: string;
};

export type Withdrawal = {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: string;
  createdAt?: string;
};

export type Transaction = {
  id: number;
  userId: number;
  amount: number;
  type?: string;
  status?: string;
  taskId?: number | null;
  createdAt?: string;
};

const DEFAULT_BASE =
  process.env?.VITE_API_BASE_URL ??
  process.env.DATABASE_URL ??
  "http://localhost:5000";

class APIClient {
  private baseUrl = DEFAULT_BASE;
  private token: string | null = null;
  private onUnauthorized?: () => void;

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
  
  setToken(token: string | null) {
    this.token = token;
  }
  
  clearToken() {
    this.token = null;
  }
  
  setOnUnauthorized(cb?: () => void) {
    this.onUnauthorized = cb;
  }

  private headers(isForm = false) {
    const headers: Record<string, string> = {};
    if (!isForm) headers["Content-Type"] = "application/json";
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    return headers;
  }

  private async request<T>(
    method: Method,
    path: string,
    body?: any,
    opts?: { isForm?: boolean; query?: Record<string, any> }
  ) {
    let url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    if (opts?.query) {
      const params = new URLSearchParams();
      Object.keys(opts.query).forEach((k) => {
        const v = opts.query![k];
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
      const qs = params.toString();
      if (qs) url = `${url}${url.includes("?") ? "&" : "?"}${qs}`;
    }

    const init: RequestInit = { method, headers: this.headers(!!opts?.isForm) };
    if (body != null && method !== "GET" && method !== "HEAD") {
      init.body = opts?.isForm ? body : JSON.stringify(body);
    }

    const res = await fetch(url, init);
    if (res.status === 401 && this.onUnauthorized) this.onUnauthorized();
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const payload = text
      ? contentType.includes("application/json")
        ? JSON.parse(text)
        : text
      : null;
    if (!res.ok) {
      const err: any = new Error(payload?.message ?? res.statusText);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload as T;
  }

  // ==================== Auth ====================
  async register(data: {
    name: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
  }) {
    return this.request<{ user: User; token: string }>(
      "POST",
      "/auth/register",
      data
    );
  }
  async verifyEmail(data: { userId: number; otp: string }) {
  return this.request<{ message: string; kycLevel: number }>(
    "POST",
    "/auth/verify-email",
    data
  );
  }

  async resendOtp(userId: number) {
  return this.request<{ message: string }>(
    "POST",
    "/auth/resend-otp",
    { userId }
  );
  }
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>(
      "POST",
      "/auth/login",
      { email, password }
    );
  }

  async forgotPassword(email: string) {
    return this.request("POST", "/auth/forgot-password", { email });
  }

  async resetPassword(token: string, password: string) {
    return this.request("POST", `/auth/reset-password/${token}`, { password });
  }

  // ==================== User ====================
  async getMe() {
    return this.request<{ user: User }>("GET", "/user/me");
  }

  async getUser(id: number) {
    return this.request<User>("GET", `/user/${id}`);
  }

  async updateUser(id: number, payload: Partial<User>) {
    return this.request<User>("PUT", `/user/${id}`, payload);
  }
 async uploadProfileImage(id: number, formData: FormData) {
  return this.request<User>(
    "PUT",
    `/user/${id}/profile-image`,
    formData,
    { isForm: true }
  );
}



  // ==================== Tasks ====================
  async listTasks(params?: {
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    return this.request<Task[]>("GET", "/tasks", undefined, { query: params });
  }

  async getTask(id: number) {
    return this.request<Task>("GET", `/tasks/${id}`);
  }

  async createTask(payload: {
    title: string;
    description?: string;
    link?: string;
    reward: number;
    totalSlots: number;
    proofType?: string;
    deadline?: string;
  }) {
    return this.request<{ message: string; task: Task }>(
      "POST",
      "/tasks",
      payload
    );
  }

  async updateTask(id: number, payload: Partial<Task>) {
    return this.request<Task>("PUT", `/tasks/${id}`, payload);
  }

  async deleteTask(id: number) {
    return this.request<{ message: string }>("DELETE", `/tasks/${id}`);
  }

  // ==================== Submissions ====================
  async createSubmission(fd: FormData) {
    return this.request<{ message: string; submission: Submission }>(
      "POST",
      "/submit",
      fd,
      { isForm: true }
    );
  }

  async listMySubmissions() {
    const candidates = ["/dashboard/my-submissions"];

    let lastErr: any = null;
    for (const path of candidates) {
      try {
        const res = await this.request<any>("GET", path);
        if (Array.isArray(res)) return res as Submission[];
        if (res && Array.isArray(res.submissions))
          return res.submissions as Submission[];
        if (res && Array.isArray(res.data)) return res.data as Submission[];
        return (res as any) ?? [];
      } catch (err: any) {
        lastErr = err;
        if (err?.status === 404) continue;
        throw err;
      }
    }
    throw lastErr ?? new Error("my-submissions endpoint not found");
  }

  async getSubmission(id: number) {
    return this.request<Submission>(
      "GET",
      `/dashboard/my-submissions/${id}`
    );
  }

  // ==================== Appeals ====================
  async submitAppeal(submissionId: number, message: string) {
    return this.request<{ message: string; appeal: Appeal }>(
      "POST",
      `/submit-task/${submissionId}/appeal`,
      { message }
    );
  }

  async listAppeals(submissionId?: number) {
    return this.request<Appeal[]>("GET", "/admin/appeals", undefined, {
      query: submissionId ? { submissionId } : undefined,
    });
  }

  // ==================== Admin - Users ====================
  async adminGetAllUsers() {
    return this.request<User[]>("GET", "/admin/users");
  }

  /**
   * Get detailed user information (Admin only)
   */
  async getUserDetails(userId: number | string) {
    try {
      const response = await this.request<any>("GET", `/admin/users/${userId}`);
      console.log('User Details Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      throw error;
    }
  }
async getUserDeposits() {
  return this.request<{
    success: boolean;
    deposits: any[];
  }>("GET", "/topUp/deposits/history");
}
  /**
   * Ban a user (Admin only)
   */
  async banUser(data: { userId: number; reason: string }) {
    try {
      const response = await this.request<any>("POST", "/admin/users/ban", data);
      return response;
    } catch (error) {
      console.error('Failed to ban user:', error);
      throw error;
    }
  }

  async adminBanUser(id: number, reason: string, freezeWallet: boolean) {
    return this.request("POST", `/admin/users/${id}/ban`, { reason, freezeWallet });
  }

  /**
   * Unban a user (Admin only)
   */
  async unbanUser(userId: number) {
    try {
      const response = await this.request<any>("POST", `/admin/users/unban/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to unban user:', error);
      throw error;
    }
  }

  async adminSuspendUser(id: number, reason: string, endDate: string, freezeWallet: boolean) {
    return this.request("POST", `/admin/users/${id}/suspend`, { reason, endDate, freezeWallet });
  }

  async adminActivateUser(id: number) {
    return this.request("POST", `/admin/users/${id}/activate`);
  }

  /**
   * Freeze user's wallet (Admin only)
   */
  async freezeWallet(data: { userId: number; reason: string }) {
    try {
      const response = await this.request<any>("POST", "/admin/users/freeze-wallet", data);
      return response;
    } catch (error) {
      console.error('Failed to freeze wallet:', error);
      throw error;
    }
  }

  async adminFreezeWallet(id: number) {
    return this.request("POST", `/admin/users/${id}/freeze-wallet`);
  }

  /**
   * Unfreeze user's wallet (Admin only)
   */
  async unfreezeWallet(userId: number) {
    try {
      const response = await this.request<any>("POST", `/admin/users/unfreeze-wallet/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to unfreeze wallet:', error);
      throw error;
    }
  }

  async adminUnfreezeWallet(id: number) {
    return this.request("POST", `/admin/users/${id}/unfreeze-wallet`);
  }

  // ==================== Admin - Tasks ====================
  async adminGetAllTasks() {
    return this.request<Task[]>("GET", "/admin/tasks");
  }

  // ==================== Admin - Submissions ====================
  async adminGetAllSubmissions() {
    return this.request<Submission[]>("GET", "/admin/submissions");
  }

  async approveSubmission(submissionId: number) {
    return this.request("PUT", `/admin/submissions/${submissionId}/approve`);
  }

  async rejectSubmission(submissionId: number, note?: string) {
    return this.request("PUT", `/admin/submissions/${submissionId}/reject`, {
      note,
    });
  }

  // ==================== Admin - Withdrawals ====================
  async adminGetWithdrawals() {
    return this.request<Withdrawal[]>("GET", "/admin/withdrawals");
  }

  // ==================== Admin - Appeals ====================
  async adminGetAllAppeals() {
    return this.request<Appeal[]>("GET", "/admin/appeals");
  }

  async resolveAppeal(
    appealId: number,
    action: { decision: "approve" | "reject"; note?: string }
  ) {
    return this.request("PUT", `/admin/appeals/${appealId}/resolve`, action);
  }

  // ==================== Admin - Deposits ====================
  async adminGetDeposits() {
    return this.request<Deposit[]>("GET", "/admin/deposits");
  }

  async adminApproveDeposit(id: number) {
    return this.request("PUT", `/admin/deposits/${id}`, {
      action: "approve"
    });
  }

  async adminRejectDeposit(id: number) {
    return this.request("PUT", `/admin/deposits/${id}`, {
      action: "reject"
    });
  }

  async adminGetDepositSettings() {
  return this.request<{
    success: boolean;
    settings: {
      id: number;
      cryptoAddress: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }>("GET", "/admin/settings/deposits");
}

  async adminUpdateDepositSettings(settings: {
  cryptoAddress?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}) {
  return this.request("PUT", "/admin/settings/deposits", settings);
}
async getDepositSettings() {
  return this.request<{
    success: boolean;
    settings: {
      id: number;
      cryptoAddress: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }>("GET", "/admin/settings/deposits");
}

async adminGetBankAccounts(){
    return this.request<{
    success: boolean;
    settings: {
      id: number;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }>("GET", "/admin/settings/deposits/bankAccounts");
}
async adminGetCryptoAddresses(){
    return this.request<{
    success: boolean;
    settings: {
      id: number;
      cryptoAddress: string;
    };
  }>("GET", "/admin/settings/deposits/bankAccounts");
}


  // ==================== Wallet ====================
  async getMyWallet() {
    return this.request<{ walletBalance: number }>("GET", "/wallet/me");
  }
  async createDepositRequest(formData: FormData) {
  return this.request<{
    success: boolean;
    message: string;
    deposit: any;
  }>("POST", "/topup/deposit", formData, { isForm: true });
}
  async topUpWallet(amount: number, method: string) {
    return this.request<{ message: string; walletBalance: number }>(
      "POST",
      "/wallet/topup",
      { amount, method }
    );
  }
  async requestWithdrawal(
    amount: number,
    bankName: string,
    accountNumber: string
  ) {
    return this.request<{ message: string; withdrawal: Withdrawal }>(
      "POST",
      "/wallet/withdraw",
      { amount, bankName, accountNumber }
    );
  }
  async listWithdrawals(userSpecific = true) {
    return this.request<Withdrawal[]>("GET", "/wallet/withdrawals");
  }
  async approveWithdrawal(withdrawalId: number) {
    return this.request("PUT", `/wallet/withdrawals/${withdrawalId}/approve`);
  }
  async rejectWithdrawal(withdrawalId: number) {
    return this.request("PUT", `/wallet/withdrawals/${withdrawalId}/reject`);
  }
  async getTransactions() {
    return this.request<Transaction[]>("GET", "/wallet/transactions");
  }

  // ==================== Bank Details ====================
  async addBankDetail(payload: {
    bankName: string;
    accountNumber: string;
    accountHolder?: string;
    isPrimary?: boolean;
  }) {
    return this.request<{ message: string; bankDetail: BankDetail }>(
      "POST",
      "/dashboard/addbankdetails",
      payload
    );
  }

  async listBankDetails() {
    return this.request<{ bankDetails: BankDetail[] }>("GET", "/dashboard/listbankdetails");
  }

  async updateBankDetail(
    id: number,
    payload: Partial<{
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }>
  ) {
    return this.request<{ message: string; bankDetail: BankDetail }>(
      "PUT",
      `/dashboard/updatebankdetails/${id}`,
      payload
    );
  }

  async setPrimaryBankDetail(id: number) {
    return this.request<{ message: string }>(
      "PUT",
      `/dashboard/setprimarybankdetails/${id}`
    );
  }

  async deleteBankDetail(id: number) {
    return this.request<{ message: string }>("DELETE", `/dashboard/deletebankdetails/${id}`);
  }

  // ==================== Dashboard ====================
  async getDashboard() {
    return this.request("GET", "/api/dashboard");
  }
}

// ==================== Utility Functions ====================
export const formatCurrency = (amount: number) => {
  if (!amount) return "₦0";
  return "₦" + amount.toLocaleString("en-NG");
};

const api = new APIClient();

export default api;