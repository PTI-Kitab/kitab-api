import ENV from "@/utils/env";
import { ThrowErrorResponse } from "@/utils/errors";

type MidtransResponse = {
  token: string;
  redirect_url: string;
};

type MidtransPayment = {
  orderId: string;
  grossAmount: number;
  curtomerDetails: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
};

export const midtransPayment = async (details: MidtransPayment) => {
  const payment = await fetch(
    "https://app.sandbox.midtrans.com/snap/v1/transactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Basic " +
          Buffer.from(ENV.APP_MIDTRANS_SERVER_KEY).toString("base64"),
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: details.orderId,
          gross_amount: details.grossAmount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: details.curtomerDetails,
      }),
    }
  );

  if (!payment.ok) {
    throw new ThrowErrorResponse(500, "Failed to create payment");
  }

  const paymentData = (await payment.json()) as MidtransResponse;

  return paymentData;
};
