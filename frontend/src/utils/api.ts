import axios from "axios";
import { type Project } from "../data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};
