import { API_BASE_URL } from "../config/constant";
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'datesitembalance';

export const createDatesItem    = (datesItem) => axios.post(REST_API_BASE_URL, datesItem);

export const getAllDatesItem    = () => axios.get(REST_API_BASE_URL);
export const getDatesItemById   = (datesItemId) => axios.get(REST_API_BASE_URL + '/' + datesItemId);

export const updateDatesItem    = (datesItemId, datesItem) => axios.put(REST_API_BASE_URL + '/' + datesItemId, datesItem);

export const deleteDatesItem    = (datesItemId) => axios.delete(REST_API_BASE_URL + '/' + datesItemId);