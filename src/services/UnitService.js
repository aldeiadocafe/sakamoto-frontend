import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'units';

export const getAllUnits = () => axios.get(REST_API_BASE_URL);

export const createUnit = (unit) => axios.post(REST_API_BASE_URL, unit);

export const getUnitById = (unitId) => axios.get(REST_API_BASE_URL + '/' + unitId);

export const updateUnit = (unitId, unit) => axios.put(REST_API_BASE_URL + '/' + unitId, unit);

export const deleteUnit = (unitId) => axios.delete(REST_API_BASE_URL + '/' + unitId);