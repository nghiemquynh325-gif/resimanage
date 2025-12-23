import { Role } from '../types';

export interface User {
  id: string;
  fullName: string;
  role: Role;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
}