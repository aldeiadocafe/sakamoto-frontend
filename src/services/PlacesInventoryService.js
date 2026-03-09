import { API_BASE_URL } from "../config/constant";
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'placesinventory';

export const getAllPlacesInventory = () => axios.get(REST_API_BASE_URL);

export const getPlacesInventory = (places) => axios.get(REST_API_BASE_URL + places);

export const createPlacesInventory = (placesInventory) => axios.post(REST_API_BASE_URL, placesInventory);

export const getPlacesInventoryById = (placesInventoryId) => axios.get(REST_API_BASE_URL + '/' + placesInventoryId);

export const updatePlacesInventory = (placesInventoryId, placesInventory) => axios.put(REST_API_BASE_URL + '/' + placesInventoryId, placesInventory);

export const deletePlacesInventory = (placesInventoryId) => axios.delete(REST_API_BASE_URL + '/' + placesInventoryId);

export const endPlaces = (placesInventoryId) => axios.post(REST_API_BASE_URL + '/finalizar/' + placesInventoryId);
