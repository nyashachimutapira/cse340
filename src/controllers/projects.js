// Import any needed model functions
import { 
    getUpcomingProjects, 
    getProjectDetails, 
    createProject, 
    updateProject,
    addVolunteer,
    removeVolunteer,
    isUserVolunteering
} from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { body, validationResult } from 'express-validator';

// Constant for the number of upcoming projects to display
const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ max: 200 })
        .withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty()
        .withMessage('Organization is required')
        .isInt()
        .withMessage('Organization must be a valid integer')
];

// Define any controller functions
const showProjectsPage = async (req, res) => {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    const title = 'Upcoming Service Projects';

    res.render('projects', { title, projects });
};  

const showProjectDetailsPage = async (req, res, next) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    // Handle case where project details are not found
    if (!projectDetails) {
        const err = new Error('Project Not Found');
        err.status = 404;
        return next(err);
    }

    const categories = await getCategoriesByProjectId(projectId);
    
    // Check if the current user is volunteering
    let isVolunteering = false;
    if (req.session && req.session.user) {
        isVolunteering = await isUserVolunteering(projectId, req.session.user.user_id);
    }

    const title = 'Project Details';
    res.render('project', { title, projectDetails, categories, isVolunteering });
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Add New Service Project';

    res.render('new-project', { title, organizations });
};

const processNewProjectForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;
    const newProjectId = await createProject(title, description, location, date, organizationId);

    req.flash('success', 'New service project created successfully!');
    res.redirect(`/project/${newProjectId}`);
};

const showEditProjectForm = async (req, res, next) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        const err = new Error('Project Not Found');
        err.status = 404;
        return next(err);
    }

    const organizations = await getAllOrganizations();
    const title = 'Edit Service Project';

    res.render('edit-project', { title, projectDetails, organizations });
};

const processEditProjectForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/edit-project/' + req.params.id);
    }

    const projectId = req.params.id;
    const { title, description, location, date, organizationId } = req.body;

    await updateProject(projectId, title, description, location, date, organizationId);

    req.flash('success', 'Service project updated successfully!');
    res.redirect(`/project/${projectId}`);
};

const volunteerForProject = async (req, res) => {
    const projectId = req.params.id;
    const user = req.session.user;

    try {
        await addVolunteer(projectId, user.user_id);
        req.flash('success', 'You have successfully volunteered for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error volunteering for project:', error);
        req.flash('error', 'An error occurred while signing you up. Please try again.');
        res.redirect(`/project/${projectId}`);
    }
};

const unvolunteerFromProject = async (req, res) => {
    const projectId = req.params.id;
    const user = req.session.user;
    const from = req.query.from;

    try {
        await removeVolunteer(projectId, user.user_id);
        req.flash('success', 'You are no longer volunteering for this project.');
        
        if (from === 'dashboard') {
            res.redirect('/dashboard');
        } else {
            res.redirect(`/project/${projectId}`);
        }
    } catch (error) {
        console.error('Error removing volunteer status:', error);
        req.flash('error', 'An error occurred while removing your volunteer sign-up. Please try again.');
        
        if (from === 'dashboard') {
            res.redirect('/dashboard');
        } else {
            res.redirect(`/project/${projectId}`);
        }
    }
};

// Export any controller functions
export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation,
    volunteerForProject,
    unvolunteerFromProject
};
