import assert from 'assert';

async function run() {
    console.log("Starting Integration Tests...");
    const baseUrl = 'http://127.0.0.1:3000';
    
    // 1. Verify Guest Access Control
    console.log("1. Verifying guest access control redirect...");
    const guestRes = await fetch(`${baseUrl}/project/volunteer/1`, { redirect: 'manual' });
    assert.strictEqual(guestRes.status, 302, "Should redirect to login");
    const location = guestRes.headers.get('location');
    assert.strictEqual(location, '/login', "Should redirect to /login");
    console.log("Success: Guest redirected correctly.");

    // 2. Perform Login as Admin
    console.log("\n2. Logging in as admin...");
    const loginRes = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            email: 'admin@example.com',
            password: 'cse340!'
        }),
        redirect: 'manual'
    });
    assert.strictEqual(loginRes.status, 302, "Login should redirect");
    const cookies = loginRes.headers.getSetCookie();
    assert(cookies.length > 0, "Should set cookie");
    const sessionCookie = cookies[0].split(';')[0];
    console.log("Success: Logged in. Session cookie acquired:", sessionCookie);

    // 3. Volunteer for project 1
    console.log("\n3. Volunteering for project 1...");
    const volunteerRes = await fetch(`${baseUrl}/project/volunteer/1`, {
        method: 'GET',
        headers: {
            'Cookie': sessionCookie
        },
        redirect: 'manual'
    });
    assert.strictEqual(volunteerRes.status, 302, "Should redirect after volunteer");
    assert.strictEqual(volunteerRes.headers.get('location'), '/project/1', "Should redirect back to project page");
    console.log("Success: Volunteered successfully.");

    // 4. Retrieve project details and verify "You are volunteering" is displayed
    console.log("\n4. Checking project details page...");
    const detailsRes = await fetch(`${baseUrl}/project/1`, {
        headers: {
            'Cookie': sessionCookie
        }
    });
    const detailsHtml = await detailsRes.text();
    assert(detailsHtml.includes('You are volunteering for this project!'), "HTML should show volunteering status");
    assert(detailsHtml.includes('/project/unvolunteer/1'), "HTML should contain link to unvolunteer");
    console.log("Success: Project details page volunteering status verified.");

    // 5. Retrieve dashboard and verify project is listed
    console.log("\n5. Checking dashboard page...");
    const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
        headers: {
            'Cookie': sessionCookie
        }
    });
    const dashboardHtml = await dashboardRes.text();
    assert(dashboardHtml.includes('Community Center Renovation'), "Dashboard should list volunteered project title");
    assert(dashboardHtml.includes('/project/unvolunteer/1?from=dashboard'), "Dashboard should show remove link");
    console.log("Success: Dashboard displays volunteered project.");

    // 6. Unvolunteer from dashboard
    console.log("\n6. Unvolunteering via dashboard link...");
    const unvolunteerRes = await fetch(`${baseUrl}/project/unvolunteer/1?from=dashboard`, {
        method: 'GET',
        headers: {
            'Cookie': sessionCookie
        },
        redirect: 'manual'
    });
    assert.strictEqual(unvolunteerRes.status, 302, "Should redirect after unvolunteer");
    assert.strictEqual(unvolunteerRes.headers.get('location'), '/dashboard', "Should redirect back to dashboard");
    console.log("Success: Unvolunteered successfully.");

    // 7. Verify dashboard is empty/updated
    console.log("\n7. Checking dashboard page after unvolunteer...");
    const dashboardRes2 = await fetch(`${baseUrl}/dashboard`, {
        headers: {
            'Cookie': sessionCookie
        }
    });
    const dashboardHtml2 = await dashboardRes2.text();
    assert(dashboardHtml2.includes('You have not volunteered for any service projects yet.'), "Dashboard should show fallback message");
    console.log("Success: Dashboard updated correctly.");

    console.log("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀🎉");
    process.exit(0);
}

run().catch(err => {
    console.error("FAIL: Integration test failed:", err);
    process.exit(1);
});
