# Neta360 · Sales & Support CRM (frontend demo)

React frontend for the Neta360 internal sales, marketing and support CRM. It covers every screen from the design: six role-based logins, dashboards, leads, pipeline, demos, proposals with approvals, customer support, onboarding and technical support.

It runs entirely in the browser with sample data, so you can demo it without a backend. Changes you make during a demo (new leads, stage moves, approvals) are saved in the browser's localStorage.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # opens http://localhost:5173
```

Build for hosting:

```bash
npm run build      # output in dist/
npm run preview    # serve the built app locally
```

`dist/` can be deployed to Netlify, Vercel or any static host. SPA routing is already configured (`public/_redirects` for Netlify, `vercel.json` for Vercel).

## Signing in

Pick a role on the login screen. Any password with 4 or more characters works.

| Role | Lands on | Sample user |
|---|---|---|
| Business Head | Executive Dashboard | Siva Krishna |
| BDM | Team Dashboard | Mahesh Reddy |
| BDE | My Day (Action Center) | Ravi Kumar |
| Product Support | Product Dashboard | Sneha Varma |
| Customer Support | Support Dashboard | Divya Sharma |
| Technical Support | Tech Dashboard | Vikram Rao |

During a demo you can switch roles from the profile menu (top right) without signing out. The same menu has **Reset demo data**.

## Suggested demo script (about 10 minutes)

1. **BDE › My Day.** Show the Action Center, the follow-up queue with Call / WhatsApp / Log update, and today's targets.
2. **Add lead.** Try an invalid mobile number to show validation, then save. You land on the new lead.
3. **Lead 360°.** Schedule a demo (stage moves to Demo Scheduled automatically), log a follow-up, edit interested modules, click the stage stepper.
4. **Pipeline.** Drag a deal between columns. Dropping on Lost asks for a reason.
5. **Proposal.** From a lead, select Create proposal. Pick a package and modules, set a 15% discount and submit.
6. **Switch to BDM.** Approve it. Because the discount is above 10%, it moves to Pending BH.
7. **Switch to Business Head.** Approve and Send to client. The lead moves to Proposal Sent.
8. **Pipeline › Won.** Drag a Pilot deal to Won. A customer and onboarding checklist are created automatically.
9. **Customer Support.** Change ticket status, escalate a ticket to Tech, tick onboarding steps.
10. **Technical Support.** The escalated ticket appears there; update issue status.

## Project structure

```
src/
  main.jsx                 app entry, providers
  App.jsx                  routes + role guard
  styles.css               design tokens and all styles
  data/
    mock.js                sample data, stages, modules, demo rate card
    roles.js               roles, navigation, route access rules
  context/AppContext.jsx   auth, toasts, data store (reducer + localStorage)
  utils/                   formatting (₹ L / Cr, dates), proposal maths
  components/
    Layout.jsx             sidebar, top bar, notifications, role switcher
    ui.jsx                 Button, Card, Kpi, Badge, Modal, Field, Ring…
    Modals.jsx             Add lead, Log follow-up, Schedule demo, Lost reason
  pages/
    Login.jsx
    DashBusinessHead.jsx   + shared Action Center
    DashBDM.jsx            targets, funnel, approvals, lead allocation
    DashBDE.jsx            My Day
    Leads.jsx              tabs, search, filters, CSV export, pagination
    LeadDetail.jsx         Lead 360°, stepper, timeline, follow-up form
    Pipeline.jsx           drag-and-drop Kanban
    Demos.jsx              week calendar, demo log, complete/cancel
    Proposals.jsx          list + builder with approval workflow
    Support.jsx            Product Support, Customer Support, Onboarding, Tech Support
```

## Business rules built in

- A BDE only sees their own leads; BDM and Business Head see everyone's.
- Priority comes from lead score: 75+ Hot, 50–74 Warm, below 50 Cold.
- Scheduling a demo moves New / Contacted / Qualified leads to Demo Scheduled.
- Completing a demo moves the lead to Demo Completed, or Lost if not interested.
- Proposal discounts up to 10% are approved by the BDM; above 10% also need the Business Head.
- Sending a proposal moves the lead to Proposal Sent and updates the deal value.
- Marking a deal Won creates the customer and its onboarding checklist.
- Every stage change and follow-up is written to the lead's activity timeline.

## Before going to production

- **Pricing:** `PACKAGES` in `src/data/mock.js` is a demo rate card. Replace it with real Neta360 pricing.
- **Backend:** all reads and writes go through the reducer in `src/context/AppContext.jsx`. Replace each action with an API call (or wrap it) and load initial data from your API instead of `mock.js`.
- **Auth:** the login is a demo. Replace `login()` in `AuthProvider` with real authentication (password or OTP) and use the role returned by the server. The route guard in `App.jsx` and `ACCESS` in `roles.js` then work unchanged, but permissions must also be enforced on the server.
