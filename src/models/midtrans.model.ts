import { t } from "elysia";

type SnapSuccess = {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  payment_code: string;
  pdf_url: string;
  finish_redirect_url: string;
};

export const MidtransDto = t.Object({
  order_id: t.String(),
  transaction_status: t.String(),
});
