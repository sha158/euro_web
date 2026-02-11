// Mock Data for the ERP Application

export const dashboardStats = {
  createdOpportunity: {
    count: 47,
    value: 2850000,
    trend: '+12%',
    trendUp: true
  },
  newlyQuoted: {
    count: 32,
    value: 1920000,
    trend: '+8%',
    trendUp: true
  },
  wonOpportunity: {
    count: 18,
    value: 1250000,
    trend: '+23%',
    trendUp: true
  },
  lostOpportunity: {
    count: 7,
    value: 380000,
    trend: '-5%',
    trendUp: false
  }
};

export const salesAnalytics = [
  { week: 'Week 1', sales: 420000, opportunities: 8 },
  { week: 'Week 2', sales: 580000, opportunities: 12 },
  { week: 'Week 3', sales: 350000, opportunities: 6 },
  { week: 'Week 4', sales: 720000, opportunities: 15 },
  { week: 'Week 5', sales: 490000, opportunities: 9 },
  { week: 'Week 6', sales: 850000, opportunities: 18 },
  { week: 'Week 7', sales: 620000, opportunities: 11 }
];

export const opportunityStages = [
  { name: 'Lead', count: 24, value: 1200000 },
  { name: 'Proposal', count: 15, value: 890000 },
  { name: 'Negotiation', count: 8, value: 520000 },
  { name: 'Closed Won', count: 18, value: 1250000 },
  { name: 'Closed Lost', count: 7, value: 380000 }
];

export const opportunities = [
  {
    id: 'OPP-001',
    projectName: 'Sunrise Towers Residential Complex',
    contact: 'Rahul Sharma',
    contactNumber: '+91 98765 43210',
    email: 'rahul.sharma@sunrise.com',
    location: 'Mumbai, Maharashtra',
    account: 'Sunrise Properties Pvt Ltd',
    managedBy: 'Priya Patel',
    status: 'active',
    stage: 'Negotiation',
    estimatedValue: 850000,
    source: 'Website Inquiry',
    expectedClosure: '2026-03-15',
    supplyStart: '2026-04-01',
    supplyEnd: '2026-06-30',
    createdAt: '2026-01-15',
    address: '123/A, Andheri East, Mumbai - 400093',
    note: 'Client interested in premium aluminum windows for 50 units'
  },
  {
    id: 'OPP-002',
    projectName: 'Green Valley Villa Project',
    contact: 'Anita Desai',
    contactNumber: '+91 87654 32109',
    email: 'anita.d@greenvalley.in',
    location: 'Pune, Maharashtra',
    account: 'Green Valley Developers',
    managedBy: 'Vikram Singh',
    status: 'active',
    stage: 'Proposal',
    estimatedValue: 620000,
    source: 'Referral',
    expectedClosure: '2026-02-28',
    supplyStart: '2026-03-15',
    supplyEnd: '2026-05-30',
    createdAt: '2026-01-20',
    address: '45, Koregaon Park, Pune - 411001',
    note: 'Looking for sliding doors and casement windows'
  },
  {
    id: 'OPP-003',
    projectName: 'Metro Business Park',
    contact: 'Suresh Kumar',
    contactNumber: '+91 76543 21098',
    email: 'suresh@metrobp.com',
    location: 'Bangalore, Karnataka',
    account: 'Metro Constructions Ltd',
    managedBy: 'Priya Patel',
    status: 'won',
    stage: 'Closed Won',
    estimatedValue: 1250000,
    source: 'Trade Show',
    expectedClosure: '2026-01-30',
    supplyStart: '2026-02-15',
    supplyEnd: '2026-04-30',
    createdAt: '2025-12-10',
    address: '78, Electronic City, Bangalore - 560100',
    note: 'Large commercial project - curtain walls and facade systems'
  },
  {
    id: 'OPP-004',
    projectName: 'Royal Residency Phase 2',
    contact: 'Meera Joshi',
    contactNumber: '+91 65432 10987',
    email: 'meera@royalres.com',
    location: 'Hyderabad, Telangana',
    account: 'Royal Builders',
    managedBy: 'Amit Verma',
    status: 'active',
    stage: 'Lead',
    estimatedValue: 480000,
    source: 'Cold Call',
    expectedClosure: '2026-04-10',
    supplyStart: '2026-05-01',
    supplyEnd: '2026-07-31',
    createdAt: '2026-02-01',
    address: '156, HITEC City, Hyderabad - 500081',
    note: 'Initial discussion phase, needs site visit'
  },
  {
    id: 'OPP-005',
    projectName: 'Coastal Heights Apartments',
    contact: 'Deepak Nair',
    contactNumber: '+91 54321 09876',
    email: 'deepak@coastalh.com',
    location: 'Chennai, Tamil Nadu',
    account: 'Coastal Developments',
    managedBy: 'Vikram Singh',
    status: 'lost',
    stage: 'Closed Lost',
    estimatedValue: 380000,
    source: 'Website Inquiry',
    expectedClosure: '2026-01-20',
    supplyStart: '2026-02-01',
    supplyEnd: '2026-04-30',
    createdAt: '2025-11-25',
    address: '89, OMR Road, Chennai - 600041',
    note: 'Lost to competitor - price sensitive'
  },
  {
    id: 'OPP-006',
    projectName: 'Heritage Tech Campus',
    contact: 'Kavitha Reddy',
    contactNumber: '+91 43210 98765',
    email: 'kavitha@heritagetech.in',
    location: 'Bangalore, Karnataka',
    account: 'Heritage IT Solutions',
    managedBy: 'Priya Patel',
    status: 'active',
    stage: 'Negotiation',
    estimatedValue: 920000,
    source: 'LinkedIn Campaign',
    expectedClosure: '2026-03-05',
    supplyStart: '2026-03-20',
    supplyEnd: '2026-06-15',
    createdAt: '2026-01-08',
    address: '234, Whitefield, Bangalore - 560066',
    note: 'IT campus project - energy efficient glazing required'
  },
  {
    id: 'OPP-007',
    projectName: 'Paradise Mall Extension',
    contact: 'Rajesh Menon',
    contactNumber: '+91 32109 87654',
    email: 'rajesh@paradise.com',
    location: 'Kochi, Kerala',
    account: 'Paradise Group',
    managedBy: 'Amit Verma',
    status: 'won',
    stage: 'Closed Won',
    estimatedValue: 1580000,
    source: 'Referral',
    expectedClosure: '2026-02-01',
    supplyStart: '2026-02-20',
    supplyEnd: '2026-05-31',
    createdAt: '2025-12-18',
    address: '56, MG Road, Kochi - 682011',
    note: 'Mall extension - premium facade with automated systems'
  },
  {
    id: 'OPP-008',
    projectName: 'Skyline Office Complex',
    contact: 'Arun Kapoor',
    contactNumber: '+91 21098 76543',
    email: 'arun@skylineoff.com',
    location: 'Delhi NCR',
    account: 'Skyline Developers',
    managedBy: 'Vikram Singh',
    status: 'active',
    stage: 'Proposal',
    estimatedValue: 720000,
    source: 'Trade Show',
    expectedClosure: '2026-03-25',
    supplyStart: '2026-04-15',
    supplyEnd: '2026-07-15',
    createdAt: '2026-01-28',
    address: '78, Sector 62, Noida - 201301',
    note: 'High-rise office building - needs structural analysis'
  }
];

export const quotes = [
  {
    id: 'NEW-QT-00000994',
    opportunityId: 'OPP-EURO',
    projectName: 'euro',
    revisionNo: 1,
    revisionTitle: 'Initial Design',
    area: 7.685,
    quantity: 5,
    value: 40499.46,
    status: 'active',
    validUntil: '2026-03-01',
    createdAt: '2026-02-09',
    supplyStart: '2026-04-01',
    supplyEnd: '2026-06-30',
    contact: 'Shamshu',
    managedBy: 'Admin'
  },
  {
    id: 'QT-2026-001',
    opportunityId: 'OPP-001',
    projectName: 'Sunrise Towers Residential Complex',
    revisionNo: 3,
    revisionTitle: 'Final Revision with Updated Specs',
    area: 2450.5,
    quantity: 156,
    value: 850000,
    status: 'active',
    validUntil: '2026-03-01',
    createdAt: '2026-02-05',
    supplyStart: '2026-04-01',
    supplyEnd: '2026-06-30',
    contact: 'Rahul Sharma',
    managedBy: 'Priya Patel'
  },
  {
    id: 'QT-2026-002',
    opportunityId: 'OPP-002',
    projectName: 'Green Valley Villa Project',
    revisionNo: 2,
    revisionTitle: 'Revised with Premium Options',
    area: 1820.0,
    quantity: 98,
    value: 620000,
    status: 'active',
    validUntil: '2026-02-20',
    createdAt: '2026-02-01',
    supplyStart: '2026-03-15',
    supplyEnd: '2026-05-30',
    contact: 'Anita Desai',
    managedBy: 'Vikram Singh'
  },
  {
    id: 'QT-2026-003',
    opportunityId: 'OPP-003',
    projectName: 'Metro Business Park',
    revisionNo: 4,
    revisionTitle: 'Approved Final Quote',
    area: 4250.75,
    quantity: 224,
    value: 1250000,
    status: 'won',
    validUntil: '2026-01-25',
    createdAt: '2026-01-15',
    supplyStart: '2026-02-15',
    supplyEnd: '2026-04-30',
    contact: 'Suresh Kumar',
    managedBy: 'Priya Patel'
  },
  {
    id: 'QT-2026-004',
    opportunityId: 'OPP-005',
    projectName: 'Coastal Heights Apartments',
    revisionNo: 2,
    revisionTitle: 'Competitive Pricing Revision',
    area: 1650.25,
    quantity: 112,
    value: 380000,
    status: 'lost',
    validUntil: '2026-01-15',
    createdAt: '2025-12-28',
    supplyStart: '2026-02-01',
    supplyEnd: '2026-04-30',
    contact: 'Deepak Nair',
    managedBy: 'Vikram Singh'
  },
  {
    id: 'QT-2026-005',
    opportunityId: 'OPP-006',
    projectName: 'Heritage Tech Campus',
    revisionNo: 1,
    revisionTitle: 'Initial Quote',
    area: 3120.0,
    quantity: 186,
    value: 920000,
    status: 'active',
    validUntil: '2026-03-10',
    createdAt: '2026-02-08',
    supplyStart: '2026-03-20',
    supplyEnd: '2026-06-15',
    contact: 'Kavitha Reddy',
    managedBy: 'Priya Patel'
  },
  {
    id: 'QT-2026-006',
    opportunityId: 'OPP-007',
    projectName: 'Paradise Mall Extension',
    revisionNo: 5,
    revisionTitle: 'Final Approved with Automation',
    area: 5680.5,
    quantity: 312,
    value: 1580000,
    status: 'won',
    validUntil: '2026-01-28',
    createdAt: '2026-01-10',
    supplyStart: '2026-02-20',
    supplyEnd: '2026-05-31',
    contact: 'Rajesh Menon',
    managedBy: 'Amit Verma'
  },
  {
    id: 'QT-2026-007',
    opportunityId: 'OPP-008',
    projectName: 'Skyline Office Complex',
    revisionNo: 1,
    revisionTitle: 'Preliminary Estimate',
    area: 2890.0,
    quantity: 178,
    value: 720000,
    status: 'active',
    validUntil: '2026-03-20',
    createdAt: '2026-02-06',
    supplyStart: '2026-04-15',
    supplyEnd: '2026-07-15',
    contact: 'Arun Kapoor',
    managedBy: 'Vikram Singh'
  }
];

export const teamMembers = [
  { id: 1, name: 'Priya Patel', role: 'Sales Manager', avatar: 'PP' },
  { id: 2, name: 'Vikram Singh', role: 'Senior Sales Executive', avatar: 'VS' },
  { id: 3, name: 'Amit Verma', role: 'Sales Executive', avatar: 'AV' },
  { id: 4, name: 'Neha Gupta', role: 'Sales Executive', avatar: 'NG' }
];

export const opportunitySources = [
  'Website Inquiry',
  'Referral',
  'Trade Show',
  'Cold Call',
  'LinkedIn Campaign',
  'Google Ads',
  'Partner Network',
  'Direct Mail'
];

export const opportunityStageOptions = [
  'Lead',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const recentActivities = [
  { id: 1, type: 'quote', message: 'New quote created for Heritage Tech Campus', time: '2 hours ago', icon: '📝' },
  { id: 2, type: 'opportunity', message: 'Opportunity "Sunrise Towers" moved to Negotiation', time: '4 hours ago', icon: '🎯' },
  { id: 3, type: 'won', message: 'Paradise Mall Extension marked as Won!', time: '1 day ago', icon: '🎉' },
  { id: 4, type: 'quote', message: 'Quote revision submitted for Green Valley Villa', time: '1 day ago', icon: '📝' },
  { id: 5, type: 'opportunity', message: 'New opportunity created: Skyline Office Complex', time: '2 days ago', icon: '🎯' }
];

export const quoteDesigns = {
  'euro': [
    {
      id: 'w1',
      name: 'w1',
      qty: 5,
      image: 'https://via.placeholder.com/300x400?text=Window+Design',
      location: 'Location :',
      series: 'VEKA - I 60 CASEMENT SERIES',
      glass: '(1) 5 MM BLACK GLASS',
      color: 'WHITE',
      price: 8099.89,
      unitPrice: 1619.98,
      floor: '--',
      size: 'W = 1410.00; H = 1090.00',
      area: '1.537 Sqmt',
      rate: '₹5,269.94',
      weight: '26.13 kg (including hardware)',
      hardware: 'HARDWARE MATERIAL TYPE :'
    }
  ],
  'default': []
};

export const catalogItems = [
  {
    id: 'c1',
    name: 'VENTILATOR',
    series: 'NCL VEKA - I 60 CASEMENT SERIES',
    image: 'https://via.placeholder.com/300x200?text=Ventilator+Drawing',
    dims: '460 x 608'
  },
  {
    id: 'c2',
    name: 'VENTILATOR',
    series: 'NCL VEKA - I 60 CASEMENT SERIES',
    image: 'https://via.placeholder.com/300x200?text=Ventilator+Drawing',
    dims: '600 x 575'
  },
  {
    id: 'c3',
    name: 'VENTILATOR',
    series: 'VITCO 40MM CASEMENT SERIES',
    image: 'https://via.placeholder.com/300x200?text=Ventilator+Drawing',
    dims: '558 x 406'
  },
  {
    id: 'c4',
    name: 'w1',
    series: 'NCL VEKA - I 60 SLIDING SERIES',
    image: 'https://via.placeholder.com/300x200?text=Slider+Drawing',
    dims: '1500 x 1500'
  },
  {
    id: 'c5',
    name: '2.5 track with mesh',
    series: 'NCL VEKA - I 60 SLIDING SERIES',
    image: 'https://via.placeholder.com/300x200?text=Slider+Mesh',
    dims: '1524 x 1676'
  },
  {
    id: 'c6',
    name: 'VENTILATOR',
    series: 'NCL VEKA - I 60 CASEMENT SERIES',
    image: 'https://via.placeholder.com/300x200?text=Ventilator+Drawing',
    dims: '598 x 558'
  },
  {
    id: 'c7',
    name: 'arch',
    series: 'NCL VEKA - I 60 CASEMENT SERIES',
    image: 'https://via.placeholder.com/300x200?text=Arch+Window',
    dims: '610 x 1067'
  },
  {
    id: 'c8',
    name: '3 TRACK SLIDING Window',
    series: 'NCL VEKA - I 60 SLIDING SERIES',
    image: 'https://via.placeholder.com/300x200?text=3+Track+Slider',
    dims: '3881 x 1550'
  }
];
