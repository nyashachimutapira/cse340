// Import any needed model functions
import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ max: 150 })
        .withMessage('Organization name cannot exceed 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('contactEmail')
        .trim()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Enter a valid contact email')
        .isLength({ max: 255 })
        .withMessage('Contact email cannot exceed 255 characters')
];

// Define any controller functions
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';

    res.render('organizations', { title, organizations });
};

const showOrganizationDetailsPage = async (req, res, next) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    
    // Handle case where organization details are not found
    if (!organizationDetails) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }
    
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';

    res.render('organization', {title, organizationDetails, projects});
};

const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';

    res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-organization');
    }

    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png';

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

    // Set a success flash message
    req.flash('success', 'Organization added successfully!');

    res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);

    if (!organizationDetails) {
        const err = new Error('Organization Not Found');
        err.status = 404;
        return next(err);
    }

    const title = 'Edit Organization';
    res.render('edit-organization', { title, organizationDetails });
};

const processEditOrganizationForm = async (req, res) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/edit-organization/' + req.params.id);
    }

    const organizationId = req.params.id;
    const { name, description, contactEmail, logoFilename } = req.body;

    await updateOrganization(organizationId, name, description, contactEmail, logoFilename);

    // Set a success flash message
    req.flash('success', 'Organization updated successfully!');

    res.redirect(`/organization/${organizationId}`);
};

// Export any controller functions
export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
};
