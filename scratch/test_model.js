import { addVolunteer, removeVolunteer, getProjectsByVolunteer, isUserVolunteering } from '../src/models/projects.js';
import { authenticateUser } from '../src/models/users.js';
import { testConnection } from '../src/models/db.js';

async function runTests() {
    try {
        console.log('Testing Database Connection...');
        await testConnection();

        // 1. Get test user
        console.log('\nFetching test admin user via authenticateUser...');
        const user = await authenticateUser('admin@example.com', 'cse340!');
        if (!user) {
            console.error('FAIL: Test admin user admin@example.com not found!');
            process.exit(1);
        }
        console.log(`Success: Found test user ${user.name} (ID: ${user.user_id})`);

        const testProjectId = 1; // Community Center Renovation
        const userId = user.user_id;

        // 2. Clear any existing volunteer record for this test to be clean
        console.log(`\nEnsuring clean state for project ID ${testProjectId} and user ID ${userId}...`);
        await removeVolunteer(testProjectId, userId);

        // 3. Verify initial state is false
        console.log('Verifying initial volunteer state...');
        let isVol = await isUserVolunteering(testProjectId, userId);
        if (isVol) {
            console.error('FAIL: User should not be volunteering yet.');
            process.exit(1);
        }
        console.log('Success: User is not volunteering (Initial State verified).');

        // 4. Add volunteer
        console.log(`\nAdding user ${userId} as volunteer for project ${testProjectId}...`);
        await addVolunteer(testProjectId, userId);

        // 5. Verify volunteer state is now true
        console.log('Verifying volunteer state after adding...');
        isVol = await isUserVolunteering(testProjectId, userId);
        if (!isVol) {
            console.error('FAIL: User should be volunteering after addVolunteer.');
            process.exit(1);
        }
        console.log('Success: User is volunteering (After Add verified).');

        // 6. Retrieve list of projects volunteered for
        console.log('\nRetrieving projects volunteered for...');
        const list = await getProjectsByVolunteer(userId);
        console.log(`Projects found: ${list.length}`);
        const found = list.find(p => p.project_id === testProjectId);
        if (!found) {
            console.error('FAIL: Project was not found in the volunteer list.');
            process.exit(1);
        }
        console.log(`Success: Project "${found.title}" by "${found.organization_name}" found in volunteered list.`);

        // 7. Remove volunteer
        console.log(`\nRemoving user ${userId} from project ${testProjectId}...`);
        await removeVolunteer(testProjectId, userId);

        // 8. Verify volunteer state is false again
        console.log('Verifying volunteer state after removal...');
        isVol = await isUserVolunteering(testProjectId, userId);
        if (isVol) {
            console.error('FAIL: User should not be volunteering after removeVolunteer.');
            process.exit(1);
        }
        console.log('Success: User is not volunteering (After Removal verified).');

        // 9. Verify list is empty or doesn't contain the project
        console.log('Verifying list after removal...');
        const listAfter = await getProjectsByVolunteer(userId);
        const foundAfter = listAfter.find(p => p.project_id === testProjectId);
        if (foundAfter) {
            console.error('FAIL: Project is still in the volunteer list after removal.');
            process.exit(1);
        }
        console.log('Success: Project is no longer in the list (After Removal list verified).');

        console.log('\nALL MODEL FUNCTION TESTS PASSED SUCCESSFULLY! 🎉');
        process.exit(0);
    } catch (err) {
        console.error('Error running tests:', err);
        process.exit(1);
    }
}

runTests();
