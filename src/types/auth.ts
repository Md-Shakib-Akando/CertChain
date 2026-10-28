export interface SetupPasswordInvitedUser {
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
}

export interface UseSetupPasswordReturn {
  token: string | null;
  isValidating: boolean;
  isValidToken: boolean;
  tokenError: string | null;
  invitedUser: SetupPasswordInvitedUser | null;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSubmitting: boolean;
  submitError: string | null;
  isSuccess: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  passwordStrength: {
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
  };
}
