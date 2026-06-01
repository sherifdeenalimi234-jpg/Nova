
import { createProject, getProject } from './lib/actions/projects';
import { createClient } from './lib/supabase/server';

async function verifyFlow() {
  console.log("Starting Verification Flow...");

  const testProject = {
    title: "Test Verification Node",
    short_description: "A test project to verify creation and visibility flow.",
    full_description: "Full description for verification purposes.",
    category: "Research",
    visibility: "Public" as const,
    project_type: "Live Project" as const,
  };

  try {
    const result = await createProject(testProject);

    if (result.error) {
      console.error("Project Creation Failed:", result.error);
      return;
    }

    const project = result.data;
    console.log("Project Created Successfully:", project.id, project.slug);

    if (!project.slug) {
      console.error("Slug missing in created project!");
    } else {
      console.log("Slug verified:", project.slug);
    }

    const { data: fetchedProject, error: fetchError } = await getProject(project.id);

    if (fetchError || !fetchedProject) {
      console.error("Project Lookup Failed:", fetchError?.message || "Not found");
    } else {
      console.log("Project Resolution Verified for ID:", fetchedProject.id);
      console.log("Member Count Verified:", fetchedProject.project_members?.length);
    }

  } catch (e) {
    console.error("Unexpected Error during verification:", e);
  }
}

// verifyFlow(); // Commented out as this is a skeleton for what I'd run if I had a script runner
console.log("Verification script prepared.");
