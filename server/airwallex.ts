// Airwallex API configuration and service functions

const AIRWALLEX_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.airwallex.com"
    : "https://api-demo.airwallex.com";

const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;

// Authentication
export async function getAirwallexToken(): Promise<string> {
  if (!AIRWALLEX_CLIENT_ID || !AIRWALLEX_API_KEY) {
    throw new Error("Airwallex credentials not configured");
  }

  console.log("Authenticating with Airwallex:", AIRWALLEX_BASE_URL);
  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/authentication/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": AIRWALLEX_CLIENT_ID,
        "x-api-key": AIRWALLEX_API_KEY,
      },
      body: JSON.stringify({}),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to authenticate with Airwallex: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  return data.token;
}

// Product creation
export async function createAirwallexProduct(
  planName: string,
  description: string,
) {
  const token = await getAirwallexToken();

  const response = await fetch(`${AIRWALLEX_BASE_URL}/api/v1/products/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: planName,
      description: description,
      type: "service",
      request_id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create product: ${response.status} ${errorText}`,
    );
  }

  const productData = await response.json();
  console.log(
    "Product created successfully:",
    JSON.stringify(productData, null, 2),
  );
  return productData;
}

// Price creation
export async function createAirwallexPrice(
  productId: string,
  amount: number,
  currency: string,
  billingCycle: string,
  planName: string,
) {
  const token = await getAirwallexToken();

  // Generate description based on plan and billing cycle
  const description = `${planName} Plan: $${amount} / ${billingCycle === "yearly" ? "year" : "month"}`;

  const requestBody = {
    active: true,
    billing_type: "IN_ADVANCE",
    currency: currency,
    description: description,
    flat_amount: amount,
    pricing_model: "FLAT",
    product_id: productId,
    recurring: {
      period: 1,
      period_unit: billingCycle === "yearly" ? "YEAR" : "MONTH",
    },
    request_id: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  console.log(
    "Creating price with request body:",
    JSON.stringify(requestBody, null, 2),
  );

  const response = await fetch(`${AIRWALLEX_BASE_URL}/api/v1/prices/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create price: ${response.status} ${errorText}`);
  }

  const priceData = await response.json();
  console.log(
    "Price created successfully:",
    JSON.stringify(priceData, null, 2),
  );
  return priceData;
}

// Billing customer creation
export async function createAirwallexBillingCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
) {
  const token = await getAirwallexToken();

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/billing_customers/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-api-version": "2025-08-29",
      },
      body: JSON.stringify({
        address: {
          country_code: "US",
        },
        email,
        request_id: `billing_cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "INDIVIDUAL",
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create billing customer: ${response.status} ${errorText}`,
    );
  }

  const customerData = await response.json();
  console.log(
    "Billing customer created successfully:",
    JSON.stringify(customerData, null, 2),
  );
  return customerData;
}

// Billing checkout creation
export async function createAirwallexBillingCheckout(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  const token = await getAirwallexToken();

  const response = await fetch(
    `${AIRWALLEX_BASE_URL}/api/v1/billing_checkouts/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-api-version": "2025-08-29",
      },
      body: JSON.stringify({
        mode: "subscription",
        customer_id: customerId,
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create billing checkout: ${response.status} ${errorText}`,
    );
  }

  const checkoutData = await response.json();
  console.log(
    "Billing checkout created successfully:",
    JSON.stringify(checkoutData, null, 2),
  );
  return checkoutData;
}
