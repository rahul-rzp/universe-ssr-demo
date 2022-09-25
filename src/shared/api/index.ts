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

export const fetchSlowApi = async (): Promise<void> => {
  const response = await axios.get(
    `https://www.7timer.info/bin/astro.php?lon=113.2&lat=23.1&ac=0&unit=metric&output=json&tzshift=0`,
  );
  return response.data;
};
