import { createUser } from '../src/lib/actions/users';

async function test() {
    console.log('Testing createUser with sequential ID...');
    const res = await createUser({
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        role: 'EMPLOYEE',
        nationalId: '1234567890'
    } as any);
    
    console.log('Result:', JSON.stringify(res, null, 2));
}

test();
