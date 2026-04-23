import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

const BASE = ENDPOINTS.TEAMS;

export const getTeams = () => axiosInstance.get(BASE);

export const getTeam = (id) => axiosInstance.get(`${BASE}/${id}`);

export const createTeam = (data) => axiosInstance.post(BASE, data);

export const updateTeam = (id, data) => axiosInstance.put(`${BASE}/${id}`, data);

export const deleteTeam = (id) => axiosInstance.delete(`${BASE}/${id}`);

export const joinTeam = (id) => axiosInstance.post(`${BASE}/${id}/join`);

export const leaveTeam = (id) => axiosInstance.post(`${BASE}/${id}/leave`);

export const adminAddMember = (teamId, userId) =>
  axiosInstance.post(`${BASE}/${teamId}/members/${userId}`);

export const adminRemoveMember = (teamId, userId) =>
  axiosInstance.delete(`${BASE}/${teamId}/members/${userId}`);
