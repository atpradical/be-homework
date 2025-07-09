// export type User = {
//   login: string;
//   email: string;
//   password: string;
//   createdAt: Date;
// };

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type MeViewModel = {
  userId: string;
  login: string;
  email: string;
};
