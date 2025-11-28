// Minimal fetch-based TypeScript client for the backend in src/app.js

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  walletBalance?: number;
  createdAt?: string;
};

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  reward?: number;
  deadline?: string | null;
  totalSlots?: number;
  remainingSlots?: number;
  proofType?: string | null;
  userId?: number;
  escrowAmount?: number;
  createdAt?: string;
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

const DEFAULT_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:5000";

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

  private async request<T>(method: Method, path: string, body?: any, opts?: { isForm?: boolean; query?: Record<string, any> }) {
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
    const payload = text ? (contentType.includes("application/json") ? JSON.parse(text) : text) : null;
    if (!res.ok) {
      const err: any = new Error(payload?.message ?? res.statusText);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload as T;
  }

  // Auth
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    return this.request<{ user: User; token: string }>("POST", "/api/auth/register", data);
  }
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("POST", "/api/auth/login", { email, password });
  }

  // User
  async getMe() {
    return this.request<{ user: User }>("GET", "/api/user/me");
  }
  async getUser(id: number) {
    return this.request<User>("GET", `/api/user/${id}`);
  }
  async updateUser(id: number, payload: Partial<User>) {
    return this.request<User>("PUT", `/api/user/${id}`, payload);
  }

  // Tasks
  async listTasks(params?: { status?: string; q?: string; page?: number; limit?: number }) {
    return this.request<Task[]>("GET", "/tasks", undefined, { query: params });
  }
  async getTask(id: number) {
    return this.request<Task>("GET", `/tasks/${id}`);
  }
  async createTask(payload: {
    title: string;
    description?: string;
    reward: number;
    totalSlots: number;
    proofType?: string;
    deadline?: string;
  }) {
    return this.request<{ message: string; task: Task }>("POST", "/tasks", payload);
  }
  async updateTask(id: number, payload: Partial<Task>) {
    return this.request<Task>("PUT", `/tasks/${id}`, payload);
  }
  async deleteTask(id: number) {
    return this.request<{ message: string }>("DELETE", `/tasks/${id}`);
  }

  // Submissions (FormData for images)
  async createSubmission(fd: FormData) {
    return this.request<{ message: string; submission: Submission }>("POST", "/submit-task", fd, { isForm: true });
  }
  async listMySubmissions() {
    return this.request<Submission[]>("GET", "/api/dashboard/my-submissions/");
  }
  async getSubmission(id: number) {
    return this.request<Submission>("GET", `/api/dashboard/my-submissions/${id}`);
  }
  // Appeal - common patterns supported
  async submitAppeal(submissionId: number, message: string) {
    // route param preferred
    return this.request<{ message: string; appeal: Appeal }>("POST", `/submit-task/${submissionId}/appeal`, { message });
  }
  async listAppeals(submissionId?: number) {
    return this.request<Appeal[]>("GET", "/admin/appeals", undefined, { query: submissionId ? { submissionId } : undefined });
  }

  // Admin actions
  async adminGetAllUsers() {
    return this.request<User[]>("GET", "/admin/users");
  }
  async adminGetAllTasks() {
    return this.request<Task[]>("GET", "/admin/tasks");
  }
  async adminGetAllSubmissions() {
    return this.request<Submission[]>("GET", "/admin/submissions");
  }
  async approveSubmission(submissionId: number) {
    return this.request("PUT", `/admin/submissions/${submissionId}/approve`);
  }
  async rejectSubmission(submissionId: number, note?: string) {
    return this.request("PUT", `/admin/submissions/${submissionId}/reject`, { note });
  }
  async adminGetWithdrawals() {
    return this.request<Withdrawal[]>("GET", "/admin/withdrawals");
  }
  async adminGetAllAppeals() {
    return this.request<Appeal[]>("GET", "/admin/appeals");
  }
  async resolveAppeal(appealId: number, action: { decision: "approve" | "reject"; note?: string }) {
    return this.request("PUT", `/admin/appeals/${appealId}/resolve`, action);
  }

  // Wallet / Topup / Withdrawal
  async getMyWallet() {
    return this.request<{ walletBalance: number }>("GET", "/wallet/me");
  }
  async topUpWallet(amount: number) {
    return this.request<{ message: string; walletBalance: number }>("POST", "/wallet/topup", { amount });
  }
  async requestWithdrawal(amount: number, bankName: string, accountNumber: string) {
    return this.request<{ message: string; withdrawal: Withdrawal }>("POST", "/wallet/withdraw", {
      amount,
      bankName,
      accountNumber,
    });
  }
  async listWithdrawals(userSpecific = true) {
    // GET /wallet/withdrawals returns either user-specific or admin view depending on role
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

  // Dashboard
  async getDashboard() {
    return this.request("GET", "/api/dashboard");
  }
}

const api = new APIClient();

export default api;