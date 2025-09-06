export const JHARKHAND_DISTRICTS = [
  'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'East Singhbhum', 'Giridih',
  'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Koderma', 'Khunti',
  'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj',
  'Seraikela Kharsawan', 'Simdega', 'Dumka', 'Garhwa', 'Latehar', 'West Singhbhum'
];

export const CATEGORIES = [
  'Municipal',
  'Fire Department',
  'Water Supply',
  'Electricity',
  'Sewage & Drainage',
  'Public Safety',
  'Others'
];

export const SUBCATEGORIES = {
  'Municipal': [
    'Pothole',
    'Overflowing Garbage Bin',
    'Broken Streetlight',
    'Road Construction',
    'Park Maintenance',
    'Other Municipal Issue'
  ],
  'Fire Department': [
    'Fire Hazard',
    'Emergency Access',
    'Fire Safety Equipment',
    'Other Fire Safety Issue'
  ],
  'Water Supply': [
    'No Water Supply',
    'Contaminated Water',
    'Pipe Leakage',
    'Low Water Pressure',
    'Other Water Issue'
  ],
  'Electricity': [
    'Power Outage',
    'Damaged Power Lines',
    'Faulty Street Lights',
    'Transformer Issues',
    'Other Electricity Issue'
  ],
  'Sewage & Drainage': [
    'Blocked Drain',
    'Sewage Overflow',
    'Poor Drainage',
    'Other Drainage Issue'
  ],
  'Public Safety': [
    'Traffic Signal Issues',
    'Road Safety',
    'Public Lighting',
    'Other Safety Issue'
  ],
  'Others': [
    'Environmental Issue',
    'Public Transport',
    'General Complaint',
    'Other Issue'
  ]
};

export const REPORT_STATUS = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  false_complaint: 'False Complaint',
  withdrawn: 'Withdrawn'
};

export const STATUS_COLORS = {
  submitted: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  false_complaint: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};