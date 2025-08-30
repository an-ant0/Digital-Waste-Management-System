type AddressInfo = {
  firstName: string;
  middleName: string;
  lastName: string;
  homeNumber: string;
  wardNumber: string;
  localityName: string;
};

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

// New shared type for user authentication parameters
export type UserRole = 'user' | 'admin' | 'truckdriver' | undefined;
export type AuthParams = {
  userId: string;
  role: UserRole;
  userName?: string;
};

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Selection: undefined;
  UserLogin: undefined;
  AdminLogin: undefined;

  Signup1: undefined;
  Signup2: Signup2Params;
  Signup3: Signup3Params;
  Signup4: Signup4Params;

  UserDashboard: AuthParams;
  Profile: { userId: string };
  Rewards: undefined;
  RewardHistory: { userId: string };
  ReportWaste: undefined;
  ReportHistory: undefined;
  CustomPickup: undefined;
  Support: undefined;
  Feedback: undefined;
  Badges: undefined;
  Leaderboard: undefined;
  RedeemedPoints: { userId: string };

  AdminDashboard: AuthParams;
  AdminProfile: { userId: string };
  ManageUsers: undefined;
  AdminWasteReview: undefined;
  AdminWasteHistory: undefined;
  AdminCustomPickup: undefined;
  TruckManagement: undefined;
  TruckLocation: undefined;
  PointsRedemption: undefined;
  AdminFeedback: undefined;
  TruckDriver: AuthParams;
};
