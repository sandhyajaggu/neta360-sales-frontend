import { GST_RATE } from '../data/mock';

// Proposal maths: (setup + annual subscription + customisation + migration) − discount, then GST.
export function calcProposal(p, pkg) {
  const setup = pkg.setup;
  const subscription = pkg.annual;
  const customization = Number(p.customization) || 0;
  const migration = Number(p.migration) || 0;
  const subtotal = setup + subscription + customization + migration;
  const discountAmt = Math.round((subtotal * (Number(p.discount) || 0)) / 100);
  const taxable = subtotal - discountAmt;
  const gst = Math.round(taxable * GST_RATE);
  return { setup, subscription, customization, migration, subtotal, discountAmt, taxable, gst, total: taxable + gst };
}

export const PROPOSAL_STATUS_COLOR = {
  Draft: '#6B7280', 'Pending BDM': '#B45309', 'Pending BH': '#C2410C', Approved: '#0B6B3A',
  Sent: '#1D4ED8', Rejected: '#B91C1C',
};
