import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log(`LOGIN 1`);

  try {
    const response = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });
    console.log(`LOGIN 2`);
    if (response.data.status === 'success') {
      console.log(`LOGIN 3`);
      showAlert('success', 'Logged in successfully');
      console.log(`LOGIN 4`);

      window.setTimeout(() => {
        console.log(`LOGIN 5`);
        location.assign('/');
        console.log(`LOGIN 6`);
      }, 1500);
    }
  } catch (error) {
    console.log(`LOGIN 7`);
    showAlert('error', error.response.data.message);
    console.log(`LOGIN 8`);
  }
};

export const logout = async (email, password) => {
  console.log(`logout 1`);

  try {
    const response = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/users/logout`,
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Logout');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', 'Error logging out!');
  }
};
