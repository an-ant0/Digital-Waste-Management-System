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

  Home: { userId?: string; role?: 'user' | 'admin'; userName?: string };

  Profile: { userId: string };
  Rewards: undefined;
  RewardHistory: undefined;
  ReportWaste: undefined;
  ReportHistory: undefined;
  CustomPickup: { userId?: string; userName?: string; userPhone?: string; userEmail?: string } | undefined; // Add optional params for CustomPickup

  Support: undefined;
  Feedback: undefined;
  Badges: undefined;
  Leaderboard: undefined;
  RedeemedPoints: { userId: string };

  AdminDashboard: undefined;
  AdminProfile: undefined;
  ManageUsers: undefined;
  AdminWasteReview: undefined;
  AdminWasteHistory: undefined;
  AdminCustomPickup: undefined;
  TruckManagement: undefined;
  TruckLocation: undefined;
  TruckLiveLocation: undefined;
  PointsRedemption: undefined;
};