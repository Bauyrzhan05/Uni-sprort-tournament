import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

const BASE = ENDPOINTS.VOLUNTEER_SHIFTS;

export const getMyVolunteerShift = () => axiosInstance.get(`${BASE}/me`);

export const saveMyVolunteerShift = (shift) =>
  axiosInstance.post(BASE, { shift });

export const getAllVolunteerShifts = () => axiosInstance.get(BASE);

export const clearVolunteerShift = (userId) =>
  axiosInstance.delete(`${BASE}/${userId}`);
