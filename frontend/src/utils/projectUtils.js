export function dedupeProjectsById(projects = []) {
    const seen = new Set();
    return projects.filter((project) => {
        const id = project?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function getProjectTitle(project) {
    return project?.title || project?.name || 'Untitled Project';
}

