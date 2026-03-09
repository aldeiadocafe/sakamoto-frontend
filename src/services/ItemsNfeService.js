import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'itemsnfe';

export const getAllItemsNfe   = () => axios.get(REST_API_BASE_URL);

export const createItemsNfe    = (itemsNfe) => axios.post(REST_API_BASE_URL, itemsNfe);
export const createAllItemsNfe = (itemsNfe) => axios.post(REST_API_BASE_URL + '/allitemsnfe', itemsNfe);

export const getItemsNfeById = (itemsNfeId) => axios.get(REST_API_BASE_URL + '/' + itemsNfeId);

export const updateItemsNfe = (itemsNfeId, ItemsNfe) => axios.put(REST_API_BASE_URL + '/' + itemsNfeId, ItemsNfe);

export const deleteItemsNfe = (itemsNfeId) => axios.delete(REST_API_BASE_URL + '/' + itemsNfeId);