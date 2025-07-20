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
  // Home now takes optional parameters for userId, role, and userName
  Home: { userId?: string; role?: 'user' | 'admin'; userName?: string };

  // User Screens
  Profile: { userId: string };
  Rewards: undefined;
  RewardHistory: undefined;
  ReportWaste: undefined; // Defined here for direct Stack navigation
  ReportHistory: undefined;
  CustomPickup: undefined; // Defined here for direct Stack navigation
  Support: undefined;
  Feedback: undefined;
  Badges: undefined;
  Leaderboard: undefined;
  RedeemedPoints: { userId: string };

  // Admin Screens
  AdminDashboard: undefined;
  AdminProfile: undefined;
  ManageUsers: undefined;
  AdminWasteReview: undefined; // Defined here for direct Stack navigation
  AdminWasteHistory: undefined;
  AdminCustomPickup: undefined; // Defined here for direct Stack navigation
  TruckManagement: undefined; // Defined here for direct Stack navigation
  TruckLocation: undefined; // Defined here for direct Stack navigation
  PointsRedemption: undefined; // Defined here for direct Stack navigation
};