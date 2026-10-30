<!-- requirement: cover page: 1 -->
# Firm Payments: Build a bulk payment service

TaxDome · Technical Challenge

Write a web service that receives bulk payment requests from a single firm.

© TaxDome 2026. All rights reserved. · taxdome.com

<!-- requirement: goal page: 2 -->
## Goal

Imagine you are a backend engineer at a practice management platform for accounting firms, like TaxDome. Thousands of firms work on the platform, from solo preparers to practices with hundreds of accountants. Each firm has a balance with us, and the money its clients pay on invoices lands there.

Firms also work with each other. A large practice sends overflow returns to solo preparers during tax season, a bookkeeping firm hands its clients' tax returns to a preparer, and a firm that brings in a client gets a referral fee. Firms settle these debts through their balances on the platform, so the same firm pays some firms and gets paid by others. Paying everyone one by one would be slow and painful, so we let a firm pay everyone it owes in bulk.

<!-- requirement: mission page: 2 -->
## Your mission

Write a web service that receives bulk payment requests from a single firm and verifies that the request is valid: the paying firm must have enough funds on its balance for all the payments in the request. If it doesn't, the entire request is denied.

<!-- requirement: denied page: 2 -->
### 422 DENIED

If the request is denied, return a 422 HTTP response.

<!-- requirement: created page: 2 -->
### 201 CREATED

Otherwise, add the payments to the database, debit the paying firm's balance, credit each receiving firm's balance, and return a 201 HTTP response.

<!-- requirement: multiple-instances page: 2 -->
### Take care to consider

Assume the server runs as multiple load-balanced instances.

<!-- requirement: relational-database page: 2 -->
Pretend you are using PostgreSQL, MySQL or a similar relational database.

<!-- requirement: language page: 2 -->
### Instructions · Language

Use one of: Ruby, Python, Go.

<!-- requirement: ai-logs page: 2 -->
### AI & WEB

You can use any AI tools — in this case please include unedited logs of your conversations with the LLM. Don't clean them up or summarize; the raw back-and-forth is exactly what we'd like to see.

<!-- requirement: libraries page: 2 -->
### Libraries

Prefer commonly used libraries whenever possible.

<!-- requirement: request-format page: 3 -->
## Request format

A bulk payment request is a JSON document. Here is an example, with each attribute explained in a comment (real requests carry no comments):

```jsonc
{
    // Identifies the firm that pays.
    "payer_firm_uuid": "3f1c9a2e-7b4d-4c1e-9a55-2d8e6f0b7c41",
    // Each entry is one payment to one firm.
    "payments": [
        {
            // Amount of the payment in US dollars, as a string, with at most
            // 2 optional decimal places. Always positive.
            "amount": "1200.75",
            // Identifies the firm that receives the payment.
            "payee_firm_uuid": "8b2e4c71-0d3a-4f6e-b1c9-5a7d2e9f4c10",
            // Description of the payment.
            "description": "Bookkeeping cleanup, 3 clients"
        },
        {
            "amount": "300",
            "payee_firm_uuid": "e5f18b3c-2a9d-4c07-8e6b-1d4a7f9c3b25",
            "description": "Referral fee, 2 clients"
        }
    ]
}
```

<!-- requirement: request-payer page: 3 -->
### payer_firm_uuid

Identifies the firm that pays.

<!-- requirement: request-entries page: 3 -->
### payments

Each entry is one payment to one firm.

<!-- requirement: request-amount page: 3 -->
### amount

Amount of the payment in US dollars, as a string, with at most 2 optional decimal places. Always positive.

<!-- requirement: request-payee page: 3 -->
### payee_firm_uuid

Identifies the firm that receives the payment.

<!-- requirement: request-description page: 3 -->
### description

Description of the payment.

<!-- requirement: database-tables page: 3 -->
## The platform's database

The database has two tables.

<!-- requirement: firms-id page: 3 -->
### firms · id

**Type:** INTEGER. Unique internal identifier of the firm.

<!-- requirement: firms-name page: 3 -->
### firms · name

**Type:** TEXT. Name of the firm.

<!-- requirement: firms-balance page: 3 -->
### firms · balance_cents

**Type:** INTEGER. Current balance of the firm, in US cents.

<!-- requirement: firms-uuid page: 3 -->
### firms · uuid

**Type:** TEXT. Public identifier of the firm, used in requests.

<!-- requirement: payments-id page: 3 -->
### payments · id

**Type:** INTEGER. Unique identifier of the payment.

<!-- requirement: payments-payer page: 3 -->
### payments · payer_firm_id

**Type:** INTEGER. id of the firms row that pays.

<!-- requirement: payments-payee page: 3 -->
### payments · payee_firm_id

**Type:** INTEGER. id of the firms row that receives the payment.

<!-- requirement: payments-amount page: 3 -->
### payments · amount_cents

**Type:** INTEGER. Amount of the payment, in US cents.

<!-- requirement: payments-description page: 3 -->
### payments · description

**Type:** TEXT. Description of the payment.

<!-- requirement: sample-seed page: 4 -->
## Sample request

Seed the database with three firms:

```sql
INSERT INTO firms (id, name, balance_cents, uuid)
VALUES (1, 'Pinecrest CPA Group', 5000000, '3f1c9a2e-7b4d-4c1e-9a55-2d8e6f0b7c41'),
             (2, 'Lopez Bookkeeping', 50000, '8b2e4c71-0d3a-4f6e-b1c9-5a7d2e9f4c10'),
             (3, 'Nair Tax Services', 200000, 'e5f18b3c-2a9d-4c07-8e6b-1d4a7f9c3b25');
```

<!-- requirement: sample-outcome page: 4 -->
Pinecrest pays Nair and Lopez. It can cover the $13,251.25 total, so the service returns 201. Afterwards Pinecrest has $36,748.75, Lopez has $1,700.75 and Nair has $14,050.50.

| Firm | Balance before | Balance after |
| --- | --- | --- |
| Pinecrest CPA Group | $50,000.00 | $36,748.75 |
| Lopez Bookkeeping | $500.00 | $1,700.75 |
| Nair Tax Services | $2,000.00 | $14,050.50 |

<!-- requirement: sample-request page: 4 -->
```json
{
    "payer_firm_uuid": "3f1c9a2e-7b4d-4c1e-9a55-2d8e6f0b7c41",
    "payments": [
        {
            "amount": "6250",
            "payee_firm_uuid": "e5f18b3c-2a9d-4c07-8e6b-1d4a7f9c3b25",
            "description": "Overflow returns, August 2026"
        },
        {
            "amount": "5800.5",
            "payee_firm_uuid": "e5f18b3c-2a9d-4c07-8e6b-1d4a7f9c3b25",
            "description": "Amended returns, August 2026"
        },
        {
            "amount": "1200.75",
            "payee_firm_uuid": "8b2e4c71-0d3a-4f6e-b1c9-5a7d2e9f4c10",
            "description": "Bookkeeping cleanup, 3 clients"
        }
    ]
}
```

<!-- requirement: deliver-source page: 5 -->
## What to deliver · 1. Source code

A repository (GitHub, GitLab or similar, either public or shared with us) containing your service. We should be able to clone it, install it, run it, and send the sample requests to it. How you choose to verify the service is part of the design. What level of testing it needs is your call.

<!-- requirement: deliver-history page: 5 -->
### 2. How you worked

Include your commit history. If you used AI tools, show us how you used them: exported chats, transcripts or prompt-and-response pairs from your sessions. Name the tools (Copilot, Cursor, Claude Code, aider or others) and say where each one fit into your workflow. Any tool is fine.

<!-- requirement: deliver-readme page: 5 -->
### 3. README

Write it as if you were opening a pull request for your teammates to review. Cover: your solution and the approach you took, the issues you ran into, the assumptions you made, possible improvements, and how to run and verify it.

<!-- requirement: questions-intro page: 5 -->
## Two quick questions

At the end of the README, please also answer:

<!-- requirement: time-question page: 5 -->
### How much time did you spend on this task?

- Less than 3h
- 3h to 6h
- More than 6h (how long?)

<!-- requirement: pride-question page: 5 -->
### How proud are you of your work?

- Very proud
- Fairly proud
- Good enough
- Somewhat disappointed

<!-- requirement: send-link page: 5 -->
When you're done, send us the link to the repository.

<!-- requirement: no-perfect-solution page: 5 -->
### No “perfect” solution expected

We're interested in your thought process and your approach to the problem, and we'll consider every submission, even an incomplete one. If you'd like to take extra time to improve or “finish” your solution, let us know beforehand and we'll review the final version.

© TaxDome 2026 · TaxDome Interview Flow · taxdome.com
