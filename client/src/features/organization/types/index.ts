export interface OrganizationSettings {
  id: string;
  organizationId: string;
  maxTokensPerDay: number;
  autoCallEnabled: boolean;
  smsGatewayEnabled: boolean;
  smsApiKey?: string | null;
  themeColor: string;
  customConfig?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  code: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: OrganizationSettings | null;
  _count?: {
    branches: number;
    users: number;
  };
}

export interface CreateOrganizationInput {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  themeColor?: string;
  maxTokensPerDay?: number;
  autoCallEnabled?: boolean;
  smsGatewayEnabled?: boolean;
  smsApiKey?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateOrganizationSettingsInput {
  maxTokensPerDay?: number;
  autoCallEnabled?: boolean;
  smsGatewayEnabled?: boolean;
  smsApiKey?: string;
  themeColor?: string;
  customConfig?: string;
}
