// Shared user address details
type AddressInfo = {
  firstName: string;
  middleName: string;
  lastName: string;
  homeNumber: string;
  wardNumber: string;
  localityName: string;
};

// Signup step-by-step details
type Signup2Params = AddressInfo;

type Signup3Params = Signup2Params & {
  profilePic: string | null;
  idType: string;
  idNumber: string;
  idPhoto: string | null;
};

type Signup4Params = Signup3Params & {
  phone: string;
  email: string;
  otp: string;
  password: string;
};

// Main Navigation Type
export type RootStackParamList = {
  // Onboarding & Auth
  Splash: undefined;
  LanguageSelection: undefined;
  Selection: undefined;
  UserLogin: undefined;
  AdminLogin: undefined;

  // Signup flow
  Signup1: undefined;
  Signup2: Signup2Params;
  Signup3: Signup3Params;
  Signup4: Signup4Params;

  // Main user/admin entry
  Home: { userId: string; role: 'user' | 'admin'; userName: string };

  // User Screens
  Profile: { userId: string };
  Rewards: undefined;
  RewardHistory: undefined;
  ReportWaste: undefined;
  ReportHistory: undefined;
  CustomPickup: undefined;
  Support: undefined;
  Feedback: undefined;
  Badges: undefined;
  Leaderboard: undefined;
  RedeemedPoints: { userId: string };

  // Admin Screens
  AdminDashboard: undefined;
  AdminProfile: undefined;
  ManageUsers: undefined;
  AdminWasteReview: undefined;
  AdminWasteHistory: undefined;
  AdminCustomPickup: undefined;
  TruckManagement: undefined;
  TruckLocation: undefined;
  PointsRedemption: undefined;
};
