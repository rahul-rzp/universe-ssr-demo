import axios from 'axios';

interface User {
  name: string;
  email: string;
  address: string;
}

type IFetchUsers = () => Promise<User[]>;
type IFetchUser = () => Promise<User>;

export const fetchUsers: IFetchUsers = async () => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/users');
  return response.data;
};

export const fetchUser: IFetchUser = async () => {
  const response = await axios.get(`https://jsonplaceholder.typicode.com/users/1`);
  return response.data;
};
