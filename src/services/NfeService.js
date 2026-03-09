import { API_BASE_URL } from '../config/constant'
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'nfes';

export const getAllNfes   = () => axios.get(REST_API_BASE_URL);
export const getChaveNfe  = (chave) => axios.get(REST_API_BASE_URL + '?chave=' + chave);
export const getNumeroNfe = (numeroSerie) => axios.get(REST_API_BASE_URL + numeroSerie);

export const createNfe = (nfe) => axios.post(REST_API_BASE_URL, nfe);

export const getNfeById = (nfeId) => axios.get(REST_API_BASE_URL + '/' + nfeId);

export const updateNfe = (nfeId, nfe) => axios.put(REST_API_BASE_URL + '/' + nfeId, nfe);

export const deleteNfe = (nfeId) => axios.delete(REST_API_BASE_URL + '/' + nfeId);