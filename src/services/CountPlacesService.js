import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'countplaces';

export const getAllCountPlaces = () => axios.get(REST_API_BASE_URL);
export const getAllByPlaces = (idPlaces) => axios.get(REST_API_BASE_URL + '?placesInventory=' + idPlaces);

export const createCountPlaces = (countplaces) => axios.post(REST_API_BASE_URL, countplaces)

export const deleteCountPlaces = (countId) => axios.delete(REST_API_BASE_URL + '/' + countId);