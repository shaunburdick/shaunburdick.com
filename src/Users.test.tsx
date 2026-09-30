import type { User } from './Users';
import { displayUser, USERS } from './Users';

describe('Users', () => {
    test('should display a user', () => {
        const user = USERS.get('shaun');
        expect(user).toBeDefined();

        const result = displayUser(user as User);

        expect(result).toBeDefined();
    });
});
