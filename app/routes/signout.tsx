import { ActionFunction, redirect } from '@remix-run/node';
import { commitSession, getSession } from './login';

export const action: ActionFunction = async ({ request }) => {
    const session = await getSession(request.headers.get('Cookie')); // Get the current session

    session.unset('isAdmin'); // Clear admin session

    const cookie = await commitSession(session); // Commit the session to update the cookie

    // Redirect to the login page
    return redirect('/login', {
        headers: {
            'Set-Cookie': cookie, // Set the updated cookie in the response
        },
    });
};
