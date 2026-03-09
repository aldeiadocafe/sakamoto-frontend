import { API_BASE_URL } from "../config/constant";
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'items';

export const createItem = (item) => axios.post(REST_API_BASE_URL, item);

export const getAllItems    = () => axios.get(REST_API_BASE_URL);
export const getItemById    = (itemId) => axios.get(REST_API_BASE_URL + '/' + itemId);

export const updateItem = (itemId, item) => axios.put(REST_API_BASE_URL + '/' + itemId, item);

export const deleteItem = (itemId) => axios.delete(REST_API_BASE_URL + '/' + itemId);