import { API_BASE_URL } from "../config/constant";
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'itemsInventory';

export const getItemsInventory = (itemsInventory) => axios.get(REST_API_BASE_URL + '?' + itemsInventory)

export const createItemsInventory = (itemsInventory) => axios.post(REST_API_BASE_URL, itemsInventory);
