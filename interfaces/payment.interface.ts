export interface PaymentCreateRequest {
  courseId: string;
}

export interface PaymentResponse {
  id: string;
  accountId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  txnRef: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}
