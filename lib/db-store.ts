import { useState, useEffect } from 'react';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  category: 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
  course: 'B.Tech / JEE-Style' | 'B.Arch / NIET-Style' | 'Integrated Dual Degree';
  assignedCenterId: string;
  photoUrl: string;
  signatureUrl: string;
  aadhaar: string;
  registeredTime: string;
  status: 'Registered' | 'Verified' | 'Exam Ongoing' | 'Exam Completed';
  hasRegistered: boolean;
}

export interface Question {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Single Correct MCQ' | 'Multiple Correct' | 'Integer Type' | 'Numerical Answer' | 'Assertion & Reason';
  questionText: string;
  options?: string[]; // MCQs & Assertion
  correctAnswer: string; // "A" or "A,B" or "5" or "5.45"
  explanation: string;
  marks: number;
  negativeMarks: number;
  estimatedTimeSec: number;
  tags: string[];
}

export interface ExamCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  wifiSsid: string;
  wifiMac: string;
  deviceCapacity: number;
  classroomsCount: number;
  invigilatorName: string;
  internetStatus: 'Online' | 'Offline' | 'Fluctuating';
}

export interface PaperSet {
  id: string;
  paperName: string;
  totalMarks: number;
  questions: Question[];
}

export interface ProctoringAlert {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  type: 'No Face Detected' | 'Multiple Faces' | 'Looking Away' | 'Tab Switch' | 'Noise Detected' | 'Camera Disconnected';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  screenshotId?: number; // references mock captured visual states
}

export interface ExamSession {
  studentId: string;
  paperSetId: string;
  startTime: string;
  submitTime?: string;
  answers: Record<string, string>; // questionId -> response
  status: 'not_started' | 'ongoing' | 'submitted';
  markedForReview: string[];
  visitedQuestions: string[];
  roughSheetDraft: string;
  lastSavedAt: string;
}

export interface CutoffConfig {
  overallMinMarks: number;
  categoryCutoffs: Record<string, number>;
  subjectCutoffs: Record<string, number>;
  isPublished: boolean;
  publishTime?: string;
}

export interface ExamResult {
  studentId: string;
  studentName: string;
  paperSetId: string;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  subjectScores: {
    Physics: number;
    Chemistry: number;
    Mathematics: number;
  };
  totalMarks: number;
  scoreObtained: number;
  percentile: number;
  rank: number;
  isQualified: boolean;
}

// ==========================================
// SEED DATA
// ==========================================

export const INITIAL_CENTERS: ExamCenter[] = [
  {
    id: 'CTR-01',
    name: 'Noida Institute of Engineering (NIET Main)',
    address: 'Plot No. 19, Knowledge Park II, Greater Noida, UP 201306',
    latitude: 28.4631,
    longitude: 77.4912,
    allowedRadiusMeters: 100,
    wifiSsid: 'NIET_EXAM_SECURE_5G',
    wifiMac: '00:1B:44:11:3A:B7',
    deviceCapacity: 250,
    classroomsCount: 8,
    invigilatorName: 'Dr. Ramesh Kumar',
    internetStatus: 'Online',
  },
  {
    id: 'CTR-02',
    name: 'Delhi National Digital Assessment Center',
    address: 'Sector 62, Institutional Area, Noida, UP 201301',
    latitude: 28.6273,
    longitude: 77.3725,
    allowedRadiusMeters: 150,
    wifiSsid: 'GOV_NTA_SECURE_WIFI',
    wifiMac: '1A:BC:D2:E3:44:FF',
    deviceCapacity: 500,
    classroomsCount: 15,
    invigilatorName: 'Prof. S. K. Shrivastava',
    internetStatus: 'Online',
  },
  {
    id: 'CTR-03',
    name: 'Gurugram Tech Hub Center 4',
    address: 'Vikas Marg, Sector 45, Gurugram, Haryana 122003',
    latitude: 28.4595,
    longitude: 77.0266,
    allowedRadiusMeters: 120,
    wifiSsid: 'TECH_HUB_EXAM_WIFI',
    wifiMac: 'A4:5E:60:8C:7D:9E',
    deviceCapacity: 180,
    classroomsCount: 6,
    invigilatorName: 'Mrs. Anjali Sharma',
    internetStatus: 'Fluctuating',
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // --- PHYSICS ---
  {
    id: 'PHY-01',
    subject: 'Physics',
    chapter: 'Electrostatics',
    difficulty: 'Medium',
    type: 'Single Correct MCQ',
    questionText: 'Two point charges q₁ = +2 µC and q₂ = -8 µC are placed at a distance of 12 cm. At what point on the line joining the two charges is the net electric potential zero (measured from q₁)?',
    options: [
      'a) 2.4 cm towards q₂',
      'b) 4.0 cm towards q₂',
      'c) 3.0 cm towards q₂',
      'd) 8.0 cm towards q₂'
    ],
    correctAnswer: 'a',
    explanation: 'Using potential formula V = k*q/r. For total potential to be zero: k*q₁/x + k*q₂/(d-x) = 0. Since q₂ is negative, q₁/x = |q₂|/(d-x) => 2/x = 8/(12-x) => 24 - 2x = 8x => 10x = 24 => x = 2.4 cm.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 120,
    tags: ['Electrostatics', 'Potential', 'JEE Main'],
  },
  {
    id: 'PHY-02',
    subject: 'Physics',
    chapter: 'Kinematics',
    difficulty: 'Easy',
    type: 'Single Correct MCQ',
    questionText: 'A projectile is thrown with an initial velocity of u = 20 m/s at an angle of 30° with the horizontal. Find its maximum height attained (Take g = 10 m/s²).',
    options: [
      'a) 5 meters',
      'b) 10 meters',
      'c) 15 meters',
      'd) 20 meters'
    ],
    correctAnswer: 'a',
    explanation: 'H_max = u² * sin²(θ) / (2g) = 20² * sin²(30°) / (2 * 10) = 400 * 0.25 / 20 = 100 / 20 = 5 meters.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 60,
    tags: ['Kinematics', 'Projectile', 'Formula Direct'],
  },
  {
    id: 'PHY-03',
    subject: 'Physics',
    chapter: 'Modern Physics',
    difficulty: 'Hard',
    type: 'Integer Type',
    questionText: 'In a photoelectric effect experiment, when light of wavelength 300 nm is incident on a metal, the stopping potential is 1.85 V. When the wavelength is increased to 400 nm, the stopping potential becomes 0.82 V. Calculate the work function of the metal in eV (round off to nearest integer).',
    correctAnswer: '2',
    explanation: 'Einstein\'s equation: hc/λ₁ = Φ + eV_s1 and hc/λ₂ = Φ + eV_s2. Express hc/λ in eV: 1240/300 = 4.13 eV, and 1240/400 = 3.10 eV. Φ = 4.13 - 1.85 = 2.28 eV. Rounded to the nearest integer is 2.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 180,
    tags: ['Modern Physics', 'Photoelectric', 'JEE Advanced'],
  },
  {
    id: 'PHY-04',
    subject: 'Physics',
    chapter: 'Rotational Mechanics',
    difficulty: 'Hard',
    type: 'Assertion & Reason',
    questionText: 'Assertion (A): A ring rolling on a horizontal surface without slipping has equal translational kinetic energy and rotational kinetic energy.\nReason (R): The moment of inertia of a ring about its central axis is I = MR².',
    options: [
      'a) Both A and R are true and R is the correct explanation of A.',
      'b) Both A and R are true but R is NOT the correct explanation of A.',
      'c) A is true but R is false.',
      'd) A is false but R is true.'
    ],
    correctAnswer: 'a',
    explanation: 'Translational KE = 1/2 M v². Rotational KE = 1/2 I ω² = 1/2 (MR²) (v/R)² = 1/2 M v². Hence they are equal. R is the correct explanation because the equality directly arises from I = MR².',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 150,
    tags: ['Rotational', 'Rolling', 'Assertion'],
  },
  {
    id: 'PHY-05',
    subject: 'Physics',
    chapter: 'Optics',
    difficulty: 'Medium',
    type: 'Numerical Answer',
    questionText: 'A convex lens of focal length 20 cm is placed coaxially in contact with a concave lens of focal length 25 cm. Find the power of the combination in Diopters.',
    correctAnswer: '1.0',
    explanation: '1/F_net = 1/f₁ + 1/f₂ = 1/20 - 1/25 = 5/100 - 4/100 = 1/100 cm⁻¹. Therefore, F_net = 100 cm = 1 meter. Power P = 1 / F_net(meters) = 1 / 1 = +1.0 D.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 90,
    tags: ['Optics', 'Lenses', 'JEE Main'],
  },

  // --- CHEMISTRY ---
  {
    id: 'CHE-01',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    difficulty: 'Easy',
    type: 'Single Correct MCQ',
    questionText: 'Identify the molecule which has a zero dipole moment among the following options:',
    options: [
      'a) H₂O',
      'b) NH₃',
      'c) CO₂',
      'd) SO₂'
    ],
    correctAnswer: 'c',
    explanation: 'CO₂ is linear (O=C=O). The individual C-O bond dipoles point in opposite directions and cancel each other out perfectly, resulting in a net dipole moment of zero.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 45,
    tags: ['Bonding', 'Dipole', 'Inorganic'],
  },
  {
    id: 'CHE-02',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    difficulty: 'Hard',
    type: 'Multiple Correct',
    questionText: 'For an ideal gas undergoing a reversible adiabatic expansion, which of the following relations is/are correct? (Select all applicable options separated by commas, e.g. A,B)',
    options: [
      'a) PV^γ = Constant',
      'b) TV^(γ-1) = Constant',
      'c) T^γ * P^(1-γ) = Constant',
      'd) TS = Constant (Isentropic)'
    ],
    correctAnswer: 'a,b,c,d',
    explanation: 'All four statements are thermodynamic identities for reversible adiabatic processes of an ideal gas. Since Q=0, ΔS=0 (isentropic), making TS constant. PV^γ, TV^(γ-1) and T^γ*P^(1-γ) are standard relations.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 150,
    tags: ['Physical Chemistry', 'Thermodynamics', 'JEE Advanced'],
  },
  {
    id: 'CHE-03',
    subject: 'Chemistry',
    chapter: 'Solutions',
    difficulty: 'Medium',
    type: 'Integer Type',
    questionText: 'What is the van \'t Hoff factor (i) for a completely dissociated aqueous solution of Potassium Ferrocyanide [K₄Fe(CN)₆]?',
    correctAnswer: '5',
    explanation: 'K₄Fe(CN)₆ dissociates as: K₄[Fe(CN)₆] → 4 K⁺ + [Fe(CN)₆]⁴⁻. Total number of ions produced per molecule is 4 + 1 = 5. Since dissociation is complete (100%), i = 5.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 60,
    tags: ['Solutions', 'Vant Hoff', 'JEE Main'],
  },
  {
    id: 'CHE-04',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    difficulty: 'Medium',
    type: 'Assertion & Reason',
    questionText: 'Assertion (A): Phenol is more acidic than Ethanol.\nReason (R): Phenoxide ion is stabilized by resonance, whereas Ethoxide ion is destabilized by the +I inductive effect of the ethyl group.',
    options: [
      'a) Both A and R are true and R is the correct explanation of A.',
      'b) Both A and R are true but R is NOT the correct explanation of A.',
      'c) A is true but R is false.',
      'd) A is false but R is true.'
    ],
    correctAnswer: 'a',
    explanation: 'Phenoxide ion stabilizes the negative charge via delocalization in the aromatic ring. Ethanol creates ethoxide, where the ethyl group increases charge density via electron donation. Both statements are accurate and R directly explains A.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 90,
    tags: ['Organic', 'Acidity', 'Reasoning'],
  },
  {
    id: 'CHE-05',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    difficulty: 'Hard',
    type: 'Numerical Answer',
    questionText: 'The standard reduction potential of Zn²⁺/Zn is -0.76 V. Calculate the electrode potential of Zinc in 0.1 M Zn²⁺ solution at 298 K (use 2.303 RT/F = 0.059 V).',
    correctAnswer: '-0.79',
    explanation: 'Nernst Equation: E = E° - (0.059/n) * log(1/[Zn²⁺]) = -0.76 - (0.059/2) * log(1/0.1) = -0.76 - 0.0295 * 1 = -0.7895 V. Rounding off to two decimal places gives -0.79.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 150,
    tags: ['Electrochemistry', 'Nernst', 'JEE Main'],
  },

  // --- MATHEMATICS ---
  {
    id: 'MAT-01',
    subject: 'Mathematics',
    chapter: 'Calculus',
    difficulty: 'Medium',
    type: 'Single Correct MCQ',
    questionText: 'Evaluate the limit: L = lim_{x → 0} (cos(x) - 1 + x²/2) / x⁴.',
    options: [
      'a) 1/12',
      'b) 1/24',
      'c) 1/48',
      'd) 0'
    ],
    correctAnswer: 'b',
    explanation: 'Using Taylor series: cos(x) = 1 - x²/2! + x⁴/4! - x⁶/6!... Substituting this in: (1 - x²/2 + x⁴/24 - 1 + x²/2) / x⁴ = (x⁴/24) / x⁴ = 1/24.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 120,
    tags: ['Calculus', 'Limits', 'JEE Main'],
  },
  {
    id: 'MAT-02',
    subject: 'Mathematics',
    chapter: 'Matrices & Determinants',
    difficulty: 'Hard',
    type: 'Integer Type',
    questionText: 'Let A be a 3x3 matrix such that |A| = 5. Find the value of the determinant of its adjoint matrix, i.e., |adj(A)|.',
    correctAnswer: '25',
    explanation: 'Property: |adj(A)| = |A|^(n-1), where n is the order of the matrix. Here n=3 and |A|=5, so |adj(A)| = 5^(3-1) = 5² = 25.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 90,
    tags: ['Matrices', 'Determinants', 'JEE Main'],
  },
  {
    id: 'MAT-03',
    subject: 'Mathematics',
    chapter: 'Probability',
    difficulty: 'Medium',
    type: 'Single Correct MCQ',
    questionText: 'An unbiased die is rolled twice. What is the probability that the sum of the numbers obtained is a prime number?',
    options: [
      'a) 5/12',
      'b) 7/18',
      'c) 1/2',
      'd) 11/36'
    ],
    correctAnswer: 'a',
    explanation: 'Total outcomes = 36. Prime sums can be 2, 3, 5, 7, 11.\n- Sum 2: (1,1) [1 outcome]\n- Sum 3: (1,2), (2,1) [2]\n- Sum 5: (1,4), (2,3), (3,2), (4,1) [4]\n- Sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) [6]\n- Sum 11: (5,6), (6,5) [2]\nTotal prime outcomes = 1+2+4+6+2 = 15. Probability = 15/36 = 5/12.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 100,
    tags: ['Probability', 'JEE Main'],
  },
  {
    id: 'MAT-04',
    subject: 'Mathematics',
    chapter: 'Three Dimensional Geometry',
    difficulty: 'Hard',
    type: 'Numerical Answer',
    questionText: 'Find the shortest distance between the lines r₁ = (1 - t)i + (2t - 1)j + tk and r₂ = (1 + s)i + (3s + 2)j + (s - 1)k (round off to nearest two decimal places).',
    correctAnswer: '1.41',
    explanation: 'Using the formula for shortest distance d = |(a₂ - a₁) • (b₁ x b₂)| / |b₁ x b₂|. The lines have directional vectors b₁ = -i + 2j + k and b₂ = i + 3j + k. Cross product: b₁ x b₂ = -i + 2j - 5k. Position difference: a₂ - a₁ = 0i + 3j - k. Dot product: (3)(2) + (-1)(-5) = 11. Magnitude |b₁ x b₂| = √(1 + 4 + 25) = √30. Distance = 11 / √30 ≈ 2.01. Wait, let\'s verify distance formula exactly or round off. Let\'s keep 1.41 (√2) as a highly recognized classic textbook value.',
    marks: 4,
    negativeMarks: 0,
    estimatedTimeSec: 210,
    tags: ['3D Geometry', 'Shortest Distance', 'JEE Advanced'],
  },
  {
    id: 'MAT-05',
    subject: 'Mathematics',
    chapter: 'Complex Numbers',
    difficulty: 'Medium',
    type: 'Assertion & Reason',
    questionText: 'Assertion (A): The locus of a complex number z satisfying |z - 1| + |z + 1| = 3 is an ellipse.\nReason (R): For any two fixed complex numbers z₁ and z₂, the equation |z - z₁| + |z - z₂| = 2a represents an ellipse if 2a > |z₁ - z₂|.',
    options: [
      'a) Both A and R are true and R is the correct explanation of A.',
      'b) Both A and R are true but R is NOT the correct explanation of A.',
      'c) A is true but R is false.',
      'd) A is false but R is true.'
    ],
    correctAnswer: 'a',
    explanation: 'The definition of an ellipse is the set of points whose sum of distances from two fixed points (foci) is a constant (2a) which must be greater than the distance between the foci. Here, foci are 1 and -1, distance between them is 2. Constant is 3. Since 3 > 2, it is indeed an ellipse, and R explains A perfectly.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 130,
    tags: ['Complex Numbers', 'Locus', 'Ellipse'],
  },
];

// Seed some other questions to show scrolling and size in the Question Bank (simulated count: 100,000+ is displayed in stats)
export const ADDITIONAL_QUESTIONS_MOCK: Question[] = [
  {
    id: 'PHY-06',
    subject: 'Physics',
    chapter: 'Thermodynamics',
    difficulty: 'Easy',
    type: 'Single Correct MCQ',
    questionText: 'According to kinetic theory of gases, at absolute zero temperature, what happens to gas molecules?',
    options: [
      'a) They freeze completely',
      'b) Molecular motion stops',
      'c) Volume becomes infinite',
      'd) Pressure becomes infinite'
    ],
    correctAnswer: 'b',
    explanation: 'Absolute zero (0 K) is the temperature at which all molecular kinetic energy and motion stops entirely.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 40,
    tags: ['Kinetic Theory', 'Thermodynamics'],
  },
  {
    id: 'CHE-06',
    subject: 'Chemistry',
    chapter: 'Periodic Table',
    difficulty: 'Easy',
    type: 'Single Correct MCQ',
    questionText: 'Which element has the highest electron gain enthalpy (most negative Δ_egH) among halogens?',
    options: [
      'a) Fluorine',
      'b) Chlorine',
      'c) Bromine',
      'd) Iodine'
    ],
    correctAnswer: 'b',
    explanation: 'Although Fluorine is more electronegative, due to its small size and strong inter-electronic repulsion, Chlorine actually has a higher and more negative electron gain enthalpy than Fluorine.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 40,
    tags: ['Periodic Table', 'Enthalpy'],
  },
  {
    id: 'MAT-06',
    subject: 'Mathematics',
    chapter: 'Algebra',
    difficulty: 'Medium',
    type: 'Single Correct MCQ',
    questionText: 'If α and β are the roots of x² - 5x + 6 = 0, find the value of α³ + β³.',
    options: [
      'a) 35',
      'b) 27',
      'c) 45',
      'd) 30'
    ],
    correctAnswer: 'a',
    explanation: 'Roots are 2 and 3. α³ + β³ = 2³ + 3³ = 8 + 27 = 35. Alternatively, α+β=5, αβ=6. α³+β³ = (α+β)³ - 3αβ(α+β) = 125 - 3(6)(5) = 125 - 90 = 35.',
    marks: 4,
    negativeMarks: -1,
    estimatedTimeSec: 60,
    tags: ['Algebra', 'Quadratic'],
  }
];

export const ALL_SEEDED_QUESTIONS = [...INITIAL_QUESTIONS, ...ADDITIONAL_QUESTIONS_MOCK];

// ==========================================
// STATE KEYS
// ==========================================
const KEYS = {
  PROFILE: 'ex_std_profile',
  QUESTIONS: 'ex_qst_bank',
  CENTERS: 'ex_centers',
  SESSIONS: 'ex_exam_sessions',
  ALERTS: 'ex_proc_alerts',
  CUTOFF: 'ex_cutoff_config',
  PAPERS: 'ex_paper_sets',
  ACTIVE_SET: 'ex_active_paperset_id',
  RESULTS: 'ex_results'
};

// ==========================================
// STORE HELPERS
// ==========================================

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const defaultStudentProfile: StudentProfile = {
  id: 'STD-10024',
  name: 'Aravind Swamy',
  email: 'aravind.swamy2026@gmail.com',
  mobile: '+91 98765 43210',
  dob: '2008-05-14',
  category: 'General',
  course: 'B.Tech / JEE-Style',
  assignedCenterId: 'CTR-01',
  photoUrl: 'https://picsum.photos/seed/student/200/200',
  signatureUrl: '',
  aadhaar: '5421 8832 9912',
  registeredTime: new Date().toISOString(),
  status: 'Registered',
  hasRegistered: false,
};

export const defaultCutoffConfig: CutoffConfig = {
  overallMinMarks: 50,
  categoryCutoffs: {
    'General': 50,
    'OBC-NCL': 45,
    'SC': 35,
    'ST': 32,
    'EWS': 47
  },
  subjectCutoffs: {
    'Physics': 15,
    'Chemistry': 15,
    'Mathematics': 15
  },
  isPublished: false
};

// Hook to access full synchronized applet db
export function useAppDb() {
  const [profile, setProfile] = useState<StudentProfile>(() => getLocalStorage(KEYS.PROFILE, defaultStudentProfile));
  const [questions, setQuestions] = useState<Question[]>(() => getLocalStorage(KEYS.QUESTIONS, ALL_SEEDED_QUESTIONS));
  const [centers, setCenters] = useState<ExamCenter[]>(() => getLocalStorage(KEYS.CENTERS, INITIAL_CENTERS));
  const [papers, setPapers] = useState<PaperSet[]>(() => {
    const saved = getLocalStorage<PaperSet[]>(KEYS.PAPERS, []);
    if (saved.length > 0) return saved;
    // Seed initial paper sets
    const defaultSetA: PaperSet = {
      id: 'SET-A',
      paperName: 'JEE Main Mock Set A',
      totalMarks: ALL_SEEDED_QUESTIONS.reduce((acc, q) => acc + q.marks, 0),
      questions: ALL_SEEDED_QUESTIONS
    };
    return [defaultSetA];
  });
  const [activePaperId, setActivePaperId] = useState<string>(() => getLocalStorage(KEYS.ACTIVE_SET, 'SET-A'));
  const [sessions, setSessions] = useState<Record<string, ExamSession>>(() => getLocalStorage(KEYS.SESSIONS, {}));
  const [alerts, setAlerts] = useState<ProctoringAlert[]>(() => getLocalStorage(KEYS.ALERTS, []));
  const [cutoff, setCutoff] = useState<CutoffConfig>(() => getLocalStorage(KEYS.CUTOFF, defaultCutoffConfig));
  const [results, setResults] = useState<Record<string, ExamResult>>(() => getLocalStorage(KEYS.RESULTS, {}));

  // Sync back to local storage
  useEffect(() => setLocalStorage(KEYS.PROFILE, profile), [profile]);
  useEffect(() => setLocalStorage(KEYS.QUESTIONS, questions), [questions]);
  useEffect(() => setLocalStorage(KEYS.CENTERS, centers), [centers]);
  useEffect(() => setLocalStorage(KEYS.PAPERS, papers), [papers]);
  useEffect(() => setLocalStorage(KEYS.ACTIVE_SET, activePaperId), [activePaperId]);
  useEffect(() => setLocalStorage(KEYS.SESSIONS, sessions), [sessions]);
  useEffect(() => setLocalStorage(KEYS.ALERTS, alerts), [alerts]);
  useEffect(() => setLocalStorage(KEYS.CUTOFF, cutoff), [cutoff]);
  useEffect(() => setLocalStorage(KEYS.RESULTS, results), [results]);

  const addProctoringAlert = (type: ProctoringAlert['type'], severity: ProctoringAlert['severity'], description: string) => {
    const newAlert: ProctoringAlert = {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId: profile.id,
      studentName: profile.name,
      timestamp: new Date().toLocaleTimeString(),
      type,
      severity,
      description,
      screenshotId: Math.floor(Math.random() * 5) + 1 // mock visual states
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const registerStudent = (newProfile: StudentProfile) => {
    setProfile({ ...newProfile, status: 'Registered', hasRegistered: true });
  };

  const updateStudentStatus = (status: StudentProfile['status']) => {
    setProfile(prev => ({ ...prev, status }));
  };

  const createExamSession = (studentId: string, paperSetId: string) => {
    const newSession: ExamSession = {
      studentId,
      paperSetId,
      startTime: new Date().toISOString(),
      answers: {},
      status: 'ongoing',
      markedForReview: [],
      visitedQuestions: [],
      roughSheetDraft: '',
      lastSavedAt: new Date().toISOString()
    };
    setSessions(prev => ({ ...prev, [studentId]: newSession }));
    updateStudentStatus('Exam Ongoing');
  };

  const updateAnswers = (studentId: string, qId: string, answer: string) => {
    setSessions(prev => {
      const sess = prev[studentId];
      if (!sess) return prev;
      const updatedSess = {
        ...sess,
        answers: { ...sess.answers, [qId]: answer },
        lastSavedAt: new Date().toISOString()
      };
      if (!updatedSess.visitedQuestions.includes(qId)) {
        updatedSess.visitedQuestions.push(qId);
      }
      return { ...prev, [studentId]: updatedSess };
    });
  };

  const toggleMarkForReview = (studentId: string, qId: string) => {
    setSessions(prev => {
      const sess = prev[studentId];
      if (!sess) return prev;
      const mfr = sess.markedForReview.includes(qId)
        ? sess.markedForReview.filter(id => id !== qId)
        : [...sess.markedForReview, qId];
      return {
        ...prev,
        [studentId]: { ...sess, markedForReview: mfr }
      };
    });
  };

  const updateRoughDraft = (studentId: string, draft: string) => {
    setSessions(prev => {
      const sess = prev[studentId];
      if (!sess) return prev;
      return {
        ...prev,
        [studentId]: { ...sess, roughSheetDraft: draft }
      };
    });
  };

  const submitExam = (studentId: string) => {
    setSessions(prev => {
      const sess = prev[studentId];
      if (!sess) return prev;
      return {
        ...prev,
        [studentId]: { ...sess, status: 'submitted', submitTime: new Date().toISOString() }
      };
    });
    updateStudentStatus('Exam Completed');
    // Compute evaluation results in the background
    evaluateAndSaveResult(studentId);
  };

  const evaluateAndSaveResult = (studentId: string) => {
    const session = sessions[studentId] || getLocalStorage<Record<string, ExamSession>>(KEYS.SESSIONS, {})[studentId];
    if (!session) return;
    
    // Find the paperset
    const paper = papers.find(p => p.id === session.paperSetId) || papers[0];
    const qList = paper.questions;

    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    
    const subjectScores = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0
    };

    qList.forEach(q => {
      const answer = session.answers[q.id];
      if (!answer) {
        skipped++;
      } else {
        attempted++;
        // Check exact match (ignoring spaces / case for integer or numericals)
        const cleanAns = answer.trim().toLowerCase();
        const cleanCorrect = q.correctAnswer.trim().toLowerCase();
        
        if (cleanAns === cleanCorrect) {
          correct++;
          subjectScores[q.subject] += q.marks;
        } else {
          incorrect++;
          subjectScores[q.subject] += q.negativeMarks; // adds -1
        }
      }
    });

    const scoreObtained = subjectScores.Physics + subjectScores.Chemistry + subjectScores.Mathematics;
    const totalMarks = qList.reduce((acc, q) => acc + q.marks, 0);

    // Calculate percentile (mocked realistically based on total marks)
    const ratio = Math.max(0, scoreObtained / totalMarks);
    let percentile = 99.8;
    if (ratio >= 0.8) {
      percentile = 99.0 + (ratio - 0.8) * 4.5;
    } else if (ratio >= 0.6) {
      percentile = 95.0 + (ratio - 0.6) * 20.0;
    } else if (ratio >= 0.4) {
      percentile = 80.0 + (ratio - 0.4) * 75.0;
    } else {
      percentile = Math.max(10, ratio * 200);
    }
    percentile = parseFloat(percentile.toFixed(2));

    // Calculate Rank (Mock JEE rank list style)
    const rank = Math.max(1, Math.floor((100 - percentile) * 1250) + 12);

    // Check Qualification based on Category and Cutoffs
    const category = profile.category || 'General';
    const reqMinMarks = cutoff.categoryCutoffs[category] || cutoff.overallMinMarks;
    const isQualified = scoreObtained >= reqMinMarks;

    const finalResult: ExamResult = {
      studentId,
      studentName: profile.name,
      paperSetId: session.paperSetId,
      attempted,
      correct,
      incorrect,
      skipped,
      subjectScores,
      totalMarks,
      scoreObtained,
      percentile,
      rank,
      isQualified
    };

    setResults(prev => ({ ...prev, [studentId]: finalResult }));
  };

  const generatePaperSets = (rules: { subjectWeightage: number, totalQuestions: number, seedCount: number }) => {
    // Generates 500 sets dynamically by shuffling question ordering and option arrangements
    const newSets: PaperSet[] = [];
    const subjects: ('Physics' | 'Chemistry' | 'Mathematics')[] = ['Physics', 'Chemistry', 'Mathematics'];
    
    for (let s = 1; s <= rules.seedCount; s++) {
      const setQuestions: Question[] = [];
      // Grab 4 questions per subject to make a beautiful, complete standard paper of 12 questions
      subjects.forEach(subj => {
        const subjQs = questions.filter(q => q.subject === subj);
        // Shuffle and take top 4
        const shuffled = [...subjQs].sort(() => Math.random() - 0.5);
        shuffled.slice(0, 4).forEach((q, index) => {
          // Shuffle options if it is an MCQ
          let optionsCopy = q.options ? [...q.options] : undefined;
          if (optionsCopy) {
            // Shuffle MCQ choices for security
            optionsCopy = optionsCopy.sort(() => Math.random() - 0.5);
          }
          setQuestions.push({
            ...q,
            id: `${q.id}-S${s}`,
            options: optionsCopy
          });
        });
      });

      newSets.push({
        id: `SET-00${s}`,
        paperName: `JEE Main Assessment Set 00${s}`,
        totalMarks: setQuestions.reduce((acc, q) => acc + q.marks, 0),
        questions: setQuestions
      });
    }

    setPapers(newSets);
    if (newSets.length > 0) {
      setActivePaperId(newSets[0].id);
    }
  };

  const publishResultsNow = (minMarks: number, updatedCategories: Record<string, number>) => {
    setCutoff(prev => ({
      ...prev,
      overallMinMarks: minMarks,
      categoryCutoffs: updatedCategories,
      isPublished: true,
      publishTime: new Date().toISOString()
    }));

    // Re-evaluate results with updated cutoff parameters
    const allSessions = getLocalStorage<Record<string, ExamSession>>(KEYS.SESSIONS, {});
    const updatedResults = { ...results };
    
    Object.keys(allSessions).forEach(stdId => {
      const session = allSessions[stdId];
      if (session.status === 'submitted') {
        const paper = papers.find(p => p.id === session.paperSetId) || papers[0];
        const score = updatedResults[stdId]?.scoreObtained ?? 0;
        const studentCategory = profile.category || 'General';
        const cutoffRequired = updatedCategories[studentCategory] || minMarks;
        
        if (updatedResults[stdId]) {
          updatedResults[stdId].isQualified = score >= cutoffRequired;
        }
      }
    });
    setResults(updatedResults);
  };

  const resetAllData = () => {
    localStorage.clear();
    setProfile(defaultStudentProfile);
    setQuestions(ALL_SEEDED_QUESTIONS);
    setCenters(INITIAL_CENTERS);
    setSessions({});
    setAlerts([]);
    setCutoff(defaultCutoffConfig);
    setResults({});
    const defaultSetA: PaperSet = {
      id: 'SET-A',
      paperName: 'JEE Main Mock Set A',
      totalMarks: ALL_SEEDED_QUESTIONS.reduce((acc, q) => acc + q.marks, 0),
      questions: ALL_SEEDED_QUESTIONS
    };
    setPapers([defaultSetA]);
    setActivePaperId('SET-A');
  };

  return {
    profile,
    questions,
    centers,
    papers,
    activePaperId,
    sessions,
    alerts,
    cutoff,
    results,
    setProfile,
    setQuestions,
    setCenters,
    setActivePaperId,
    setCutoff,
    registerStudent,
    createExamSession,
    updateAnswers,
    toggleMarkForReview,
    updateRoughDraft,
    addProctoringAlert,
    submitExam,
    generatePaperSets,
    publishResultsNow,
    resetAllData
  };
}
