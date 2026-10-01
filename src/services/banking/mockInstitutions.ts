import { BankInstitution } from './types.ts';

export const SUPPORTED_INSTITUTIONS: BankInstitution[] = [
  {
    id: 'ins_monzo',
    name: 'Monzo Bank',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_revolut',
    name: 'Revolut',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_barclays',
    name: 'Barclays',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_hsbc',
    name: 'HSBC UK',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_lloyds',
    name: 'Lloyds Bank',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_natwest',
    name: 'NatWest',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_santander',
    name: 'Santander UK',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_chase',
    name: 'Chase UK & US',
    country: 'US',
    supportsInstantSync: true,
  },
  {
    id: 'ins_starling',
    name: 'Starling Bank',
    country: 'GB',
    supportsInstantSync: true,
  },
  {
    id: 'ins_alrajhi',
    name: 'Al Rajhi Bank',
    country: 'SA',
    supportsInstantSync: true,
  },
  {
    id: 'ins_enbd',
    name: 'Emirates NBD',
    country: 'AE',
    supportsInstantSync: true,
  },
];
