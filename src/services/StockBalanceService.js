import { API_BASE_URL } from "../config/constant";
import axios from 'axios'

const REST_API_BASE_URL = API_BASE_URL + 'stockbalance'

export const getAllStockBalances = () => axios.get(REST_API_BASE_URL);

export const createStockBalance = (stockBalance) => axios.post(REST_API_BASE_URL, stockBalance);

export const updateGComEstoque = (stockBalance) => axios.post(REST_API_BASE_URL + '/gcomestoque', stockBalance);

export const getStockBalanceById = (stockBalanceId) => axios.get(REST_API_BASE_URL + '/' + stockBalanceId);

export const updateStockBalance = (stockBalanceId, stockBalance) => axios.put(REST_API_BASE_URL + '/' + stockBalanceId, stockBalance);

export const deleteStockBalance = (stockBalanceId) => axios.delete(REST_API_BASE_URL + '/' + stockBalanceId);

