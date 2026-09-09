# Payment links: safe rollout

Receptionists record an in-person settlement as **Card** or **Cash**. Apple Pay is not a separate staff method: if a payment service later offers it, it is a checkout option inside that service and payment status must still come from a verified provider webhook.

## Decision

Start the UAE pilot with one hosted payment-link provider, preferably [Network International Pay by Link](https://www.network.ae/en/merchant-solutions/ecommerce-payments/pay-by-link) or [Amazon Payment Services Payment Links](https://paymentservices.amazon.com/docs/accepting-payments/no-code/payment-links/overview). Both are designed for sending hosted checkout links; Network explicitly supports messaging and social channels.

Tabby and Tamara are optional BNPL extensions, not default methods. Their published APIs support UAE/AED flows, but their public documentation does not establish that a particular dental or medical treatment category will be underwritten. Obtain written clinic-category approval before enabling either one: [Tabby checkout](https://docs.tabby.ai/pay-in-4-custom-integration/checkout-flow), [Tamara checkout](https://docs.tamara.co/docs/direct-online-checkout).

## Phases

1. **Manual settlement — implemented.** Card and Cash can be recorded against an invoice. The API rejects Apple Pay and arbitrary values.
2. **One payment-link provider.** Clinic opens and verifies a merchant account; Reva creates a server-side checkout session, stores only the provider reference and hosted URL, and sends an approved WhatsApp template containing the link.
3. **Webhook reconciliation.** Verify provider signature, use provider event IDs for idempotency, change an invoice to Paid only from a final provider event, and write an audit event. Do not trust browser return URLs.
4. **Tabby/Tamara evaluation.** Enable exactly one only after written underwriting approval, sandbox tests, refund/cancellation handling, and clinic consent to the buyer-data fields required by the provider.

## Manual gates

- Merchant onboarding, contract, fees, settlement account and permitted clinic category.
- Provider secret, webhook secret, allowed return URLs and approved invoice wording.
- Test payment, failed payment, duplicate webhook, refund and reconciliation tests in a non-production clinic account.

The current repository deliberately does **not** claim a live Tabby or Tamara connection. Provider credentials and approval are required before phase 2 can be implemented safely.
