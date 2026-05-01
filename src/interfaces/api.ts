import type { User } from "./user";
import type { Business } from "./business";

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface CreateUserResponse {
  createUser: User;
  res: unknown;
}

export interface UpdateUserResponse {
  updateUser: User;
  res: unknown;
}

export interface BusinessResponse {
  business: Business[];
}
