import { API_BASE_URL } from "../config/constant";
import axios from 'axios'

const REST_API_BASE_URL = API_BASE_URL + 'inventorys'

export const getAllInventorys = () => axios.get(REST_API_BASE_URL);

export const createInventory = (inventory) => axios.post(REST_API_BASE_URL, inventory);

export const getInventoryById = (inventoryId) => axios.get(REST_API_BASE_URL + '/' + inventoryId);

export const updateInventory = (inventoryId, inventory) => axios.put(REST_API_BASE_URL + '/' + inventoryId, inventory);

export const deleteInventory = (inventoryId) => axios.delete(REST_API_BASE_URL + '/' + inventoryId);

export const endInventory = (inventoryId) => axios.post(REST_API_BASE_URL + '/finalizar/' + inventoryId);