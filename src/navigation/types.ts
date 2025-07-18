// frontend/navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Selection: undefined;
  UserLogin: undefined; // Changed from 'Login' to 'UserLogin' to match your previous definition
  AdminLogin: undefined;

  Signup1: undefined;

  Signup2: {
    firstName: string;
    middleName: string;
    lastName: string;
    homeNumber: string;
    wardNumber: string;
    localityName: string;
  };

  Signup3: {
    firstName: string;
    middleName: string;
    lastName: string;
    homeNumber: string;
    wardNumber: string;
    localityName: string;
    profilePic: string | null; // Changed to allow null
    idType: string;
    idNumber: string;
    idPhoto: string | null; // Changed to allow null
  };

  Signup4: {
    firstName: string;
    middleName: string;
    lastName: string;
    homeNumber: string;
    wardNumber: string;
    localityName: string;
    profilePic: string | null; // Changed to allow null
    idType: string;
    idNumber: string;
    idPhoto: string | null; // Changed to allow null
    phone: string;
    email: string;
    otp: string;
    password: string;
  };
  Home: { userId: string; role: 'user' | 'admin' }; // Corrected: Home expects userId and role
  AdminDashboard: undefined;
  Profile: { userId: string }; // Corrected: Profile expects userId
  AdminProfile: undefined;
  ManageUsers: undefined;
  Feedback: undefined;
  Rewards: undefined;
  ReportHistory: undefined;
  Support: undefined;
  RewardHistory: undefined;
  PointsRedemption: undefined;
  ReportWaste: undefined;
  AdminWasteReview: undefined;
  AdminWasteHistory: undefined;
  CustomPickup: undefined;
  AdminCustomPickup: undefined;
  TruckManagement: undefined;
  TruckLocation: undefined;
  Badges: undefined;
  Leaderboard: undefined;
};
