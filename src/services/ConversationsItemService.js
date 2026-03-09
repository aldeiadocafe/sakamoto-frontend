import { API_BASE_URL } from "../config/constant";
import axios from 'axios';

const REST_API_BASE_URL = API_BASE_URL + 'conversationsitem';

export const createConversations = (conversations) => axios.post(REST_API_BASE_URL, conversations);

export const getAllConversations  = () => axios.get(REST_API_BASE_URL);
export const getConversationsById = (conversationsId) => axios.get(REST_API_BASE_URL + '/' + conversationsId);

export const updateConversations = (conversationsId, conversations) => axios.put(REST_API_BASE_URL + '/' + conversationsId, conversations);

export const deleteConversations = (conversationsId) => axios.delete(REST_API_BASE_URL + '/' + conversationsId);