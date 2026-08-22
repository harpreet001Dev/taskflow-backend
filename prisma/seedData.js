export const usersData = [
  {
    name: "Harpreet",
    email: "harpreet@example.com",
    password: "Password@123",
  },
  {
    name: "Aman",
    email: "aman@example.com",
    password: "Password@123",
  },
  {
    name: "Simran",
    email: "simran@example.com",
    password: "Password@123",
  },
  {
    name: "Rahul",
    email: "rahul@example.com",
    password: "Password@123",
  },
  {
    name: "Neha",
    email: "neha@example.com",
    password: "Password@123",
  },
];

export const organizationsData = [
  {
    name: "TechNova Solutions",
  },
  {
    name: "CloudWorks Technologies",
  },
];

export const memberships = [
  {
    organization: "TechNova Solutions",
    user: "harpreet@example.com",
    role: "org_admin",
  },
  {
    organization: "TechNova Solutions",
    user: "aman@example.com",
    role: "member",
  },
  {
    organization: "TechNova Solutions",
    user: "simran@example.com",
    role: "member",
  },
  {
    organization: "CloudWorks Technologies",
    user: "rahul@example.com",
    role: "org_admin",
  },
  {
    organization: "CloudWorks Technologies",
    user: "neha@example.com",
    role: "member",
  },
];
export const projectsData = [
  {
    organization: "TechNova Solutions",
    name: "Task Management System",
    description: "Project for managing tasks and team work.",
  },
  {
    organization: "TechNova Solutions",
    name: "Customer Portal",
    description: "Portal for customers to manage their accounts.",
  },
  {
    organization: "CloudWorks Technologies",
    name: "Cloud Monitoring",
    description: "System for monitoring cloud infrastructure.",
  },
  {
    organization: "CloudWorks Technologies",
    name: "Internal Dashboard",
    description: "Dashboard for internal team operations.",
  },
  {
    organization: "TechNova Solutions",
    name: "Employee Management",
    description: "System for managing employee information.",
  },
];

export const tasksData = [
  // Task Management System
  {
    project: "Task Management System",
    title: "Set up authentication",
    description: "Implement user registration and login using JWT.",
    status: "done",
    priority: "high",
  },
  {
    project: "Task Management System",
    title: "Create task API",
    description: "Build APIs for creating, updating and deleting tasks.",
    status: "in_progress",
    priority: "high",
  },
  {
    project: "Task Management System",
    title: "Add task filtering",
    description: "Allow users to filter tasks by status and priority.",
    status: "todo",
    priority: "medium",
  },

  // Customer Portal
  {
    project: "Customer Portal",
    title: "Create customer profile",
    description: "Build the customer profile management functionality.",
    status: "review",
    priority: "medium",
  },
  {
    project: "Customer Portal",
    title: "Add password reset",
    description: "Implement password reset functionality for customers.",
    status: "in_progress",
    priority: "urgent",
  },

  // Employee Management
  {
    project: "Employee Management",
    title: "Create employee API",
    description: "Build APIs for creating and managing employee records.",
    status: "todo",
    priority: "high",
  },
  {
    project: "Employee Management",
    title: "Add employee search",
    description: "Allow administrators to search employees by name and email.",
    status: "done",
    priority: "low",
  },

  // Cloud Monitoring
  {
    project: "Cloud Monitoring",
    title: "Set up server monitoring",
    description: "Monitor CPU, memory and disk usage of cloud servers.",
    status: "in_progress",
    priority: "urgent",
  },
  {
    project: "Cloud Monitoring",
    title: "Create monitoring dashboard",
    description: "Display server health and resource usage on a dashboard.",
    status: "review",
    priority: "high",
  },
  {
    project: "Cloud Monitoring",
    title: "Add server alerts",
    description: "Send alerts when server resources exceed configured limits.",
    status: "todo",
    priority: "urgent",
  },

  // Internal Dashboard
  {
    project: "Internal Dashboard",
    title: "Create analytics page",
    description: "Build an analytics page for internal business metrics.",
    status: "done",
    priority: "medium",
  },
  {
    project: "Internal Dashboard",
    title: "Add role based access",
    description: "Restrict dashboard sections based on user roles.",
    status: "todo",
    priority: "high",
  },
];


export const taskAssignmentsData = [
  {
    task: "Set up authentication",
    user: "harpreet@example.com",
  },
  {
    task: "Set up authentication",
    user: "aman@example.com",
  },
  {
    task: "Create task API",
    user: "simran@example.com",
  },
  {
    task: "Add task filtering",
    user: "rahul@example.com",
  },
  {
    task: "Create customer profile",
    user: "neha@example.com",
  },
  {
    task: "Add password reset",
    user: "harpreet@example.com",
  },
  {
    task: "Create employee API",
    user: "aman@example.com",
  },
  {
    task: "Set up server monitoring",
    user: "simran@example.com",
  },
  {
    task: "Create monitoring dashboard",
    user: "rahul@example.com",
  },
  {
    task: "Add server alerts",
    user: "neha@example.com",
  },
];


export const commentsData = [
  {
    task: "Set up authentication",
    author: "harpreet@example.com",
    content: "Authentication API is completed and ready for testing.",
  },
  {
    task: "Create task API",
    author: "simran@example.com",
    content: "The create and update endpoints are working.",
  },
  {
    task: "Add task filtering",
    author: "rahul@example.com",
    content: "I will add filtering by status and priority.",
  },
  {
    task: "Create customer profile",
    author: "neha@example.com",
    content: "Profile page is ready for review.",
  },
  {
    task: "Add password reset",
    author: "harpreet@example.com",
    content: "Password reset email flow needs testing.",
  },
  {
    task: "Set up server monitoring",
    author: "simran@example.com",
    content: "CPU and memory monitoring has been configured.",
  },
  {
    task: "Create monitoring dashboard",
    author: "rahul@example.com",
    content: "Dashboard is ready for the review stage.",
  },
  {
    task: "Add server alerts",
    author: "neha@example.com",
    content: "Alert thresholds still need to be finalized.",
  },
];