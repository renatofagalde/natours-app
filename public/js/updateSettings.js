import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const uri = type === 'password' ? 'updateMyPassword' : 'updateMe';
    const url = `http://127.0.0.1:3000/api/v1/users/${uri}`;
    console.log(`change current info: ${url}`);
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (response.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      setTimeout(() => {
        location.assign('/me');
      }, 150);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
