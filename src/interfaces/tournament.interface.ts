import { IUser } from "./user.interface";

export interface ITournament {
  id?: string;
  name: string;
  registerDate: string;
  users: Array<IUser>;
}
