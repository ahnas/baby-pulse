import { createCookieSessionStorage, ActionFunction, redirect } from '@remix-run/node';
import bcrypt from 'bcrypt';

// Session storage configuration
export const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
        name: 'session',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: 'lax',
        path: '/',
        secrets: ['your-very-secure-secret'],
    },
});

// Super user credentials
const SUPER_USER_CREDENTIALS = {
    username: 'admin',
    password: '$2b$10$5RGTQXsUQrFRE.ADAOl6AeJiWaxBwm/ter7abK.BzTKOD1.Owma6y' // Replace with your hashed password
};

export const action: ActionFunction = async ({ request }) => {
    const formData = new URLSearchParams(await request.text());
    const username = formData.get('username');
    const password = formData.get('password');

    // Validate credentials
    if (username === SUPER_USER_CREDENTIALS.username && password !== null && await bcrypt.compare(password, SUPER_USER_CREDENTIALS.password)) {
        const session = await getSession();
        session.set('isAdmin', true); // Set admin session
        return redirect('/admin', {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        });
    }

    return redirect('/login'); // Redirect back on failure
};

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form method="post" className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                    />
                </div>
                <div className="mb-6">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
