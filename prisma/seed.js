import { PrismaClient } from "@prisma/client";
import {
  usersData, organizationsData,
  projectsData, tasksData, taskAssignmentsData,
  commentsData, memberships
} from "./seedData.js";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

//seed 5 users
async function seedUsers() {

  const createdUsers = []
  for (const user of usersData) {
    const hashedPassword = await hashPassword(user.password);
    const createUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      }
    })
    createdUsers.push(createUser);
  }
  console.log(`${createdUsers.length} users are seeded successfully`);

  return createdUsers;
}

//seed 2 orgs
async function seedOrganizations() {
  const createdOrganizations = [];

  for (const organization of organizationsData) {
    const createdOrganization = await prisma.organization.create({
      data: {
        name: organization.name,
      },
    });

    createdOrganizations.push(createdOrganization);
  }

  console.log(
    `Created ${createdOrganizations.length} organizations`
  );

  return createdOrganizations;
}

// seed organization members
async function seedOrgMembers(organizations, users) {

  const createdMembers = [];

  for (const membership of memberships) {
    const organization = organizations.find(
      (org) => org.name === membership.organization
    );

    const user = users.find(
      (user) => user.email === membership.user
    );

    if (!organization) {
      throw new Error(
        `Organization not found: ${membership.organization}`
      );
    }

    if (!user) {
      throw new Error(`User not found: ${membership.user}`);
    }

    const createdMember = await prisma.orgMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: membership.role,
      },
    });

    createdMembers.push(createdMember);
  }

  console.log(
    `${createdMembers.length} organization members are seeded successfully`
  );

  return createdMembers;
}

//seed multiple projects
async function seedProjects(organizations) {
  const createdProjects = [];

  for (const project of projectsData) {
    const organization = organizations.find(
      (org) => org.name === project.organization
    );

    if (!organization) {
      throw new Error(
        `Organization not found: ${project.organization}`
      );
    }

    const createdProject = await prisma.project.create({
      data: {
        organizationId: organization.id,
        name: project.name,
        description: project.description,
      },
    });

    createdProjects.push(createdProject);
  }

  console.log(`Created ${createdProjects.length} projects`);

  return createdProjects;
}

//seeding tasks
async function seedTasks(projects) {
  const createdTasks = [];

  for (const task of tasksData) {
    const project = projects.find(
      (project) => project.name === task.project
    );

    if (!project) {
      throw new Error(`Project not found: ${task.project}`);
    }

    const createdTask = await prisma.task.create({
      data: {
        projectId: project.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      },
    });

    createdTasks.push(createdTask);
  }

  console.log(`${createdTasks.length} tasks are seeded successfully`);

  return createdTasks;
}

//seed task assignments
async function seedTaskAssignments(tasks, users) {
  const createdAssignments = [];

  for (const assignment of taskAssignmentsData) {
    const task = tasks.find(
      (task) => task.title === assignment.task
    );

    const user = users.find(
      (user) => user.email === assignment.user
    );

    if (!task) {
      throw new Error(`Task not found: ${assignment.task}`);
    }

    if (!user) {
      throw new Error(`User not found: ${assignment.user}`);
    }

    const createdAssignment = await prisma.taskAssignment.create({
      data: {
        taskId: task.id,
        userId: user.id,
      },
    });

    createdAssignments.push(createdAssignment);
  }

  console.log(
    `${createdAssignments.length} task assignments are seeded successfully`
  );

  return createdAssignments;
}

//seed comments
async function seedComments(tasks, users) {
  const createdComments = [];

  for (const comment of commentsData) {
    const task = tasks.find(
      (task) => task.title === comment.task
    );

    const author = users.find(
      (user) => user.email === comment.author
    );

    if (!task) {
      throw new Error(`Task not found: ${comment.task}`);
    }

    if (!author) {
      throw new Error(`User not found: ${comment.author}`);
    }

    const createdComment = await prisma.comment.create({
      data: {
        taskId: task.id,
        userId: author.id,
        content: comment.content,
      },
    });

    createdComments.push(createdComment);
  }

  console.log(
    `${createdComments.length} comments are seeded successfully`
  );

  return createdComments;
}



//common function to call all seeders
async function main() {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.log("Database already contains seed data. Skipping seed.");
    return;
  }

  const users = await seedUsers();

  const organizations = await seedOrganizations();

  await seedOrgMembers(organizations, users);

  const projects = await seedProjects(organizations);

  const tasks = await seedTasks(projects);

  await seedTaskAssignments(tasks, users);

  await seedComments(tasks, users);
}
main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });