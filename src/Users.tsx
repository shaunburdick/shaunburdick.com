import { ConsoleLine } from './components/ConsoleOutput/ConsoleOutput';

/**
 * User interface representing a user in the system
 */
export interface User {
    /** User's display name */
    name: string;

    /** Optional path to user avatar image */
    image?: string;

    /** List of user occupations */
    occupation?: string[],

    /** User's geographic location */
    location?: string,

    /** List of user skills/expertise */
    expertise?: string[],

    /** List of relevant links for the user */
    links?: {
        /** URL to link destination */
        url: string;

        /** Text to display for the link */
        text: string;
    }[]
}

/**
 * A map of users known on the system
 */
export const USERS = new Map<string, User>();

/**
 * Format a user object into console-friendly output lines
 *
 * @param user - User object to display
 * @returns Array of console lines representing the user's information
 */
export const displayUser = (user: User) => {
    const response: ConsoleLine[] = [];

    if (user.image) {
        response.push([<img src={user.image} alt={user.name} width={'50%'}/>]);
    }
    response.push(['Name: ', user.name]);
    if (user.occupation) {
        response.push(['Occupation: ', JSON.stringify(user.occupation)]);
    }
    if (user.location) {
        response.push(['Location: ', user.location]);
    }
    if (user.expertise) {
        response.push(['Expertise: ', JSON.stringify(user.expertise, null, 2)]);
    }
    if (user.links) {
        response.push(['Links: ', ...user.links.map(link => <a href={link.url}>{link.text}</a>)]);
    }

    return response;
};

// User data below
USERS.set('shaun', {
    name: 'Shaun Burdick',
    image: 'img/shaun.png',
    occupation: [ 'Father', 'Husband', 'Leader', 'Engineer' ],
    location: 'Syracuse, NY',
    expertise: [
        'Engineering Leader',
        'Web Architecture and Design',
        'Large scale data collection',
        'API Design and Implementation',
        'Agile/Scrum team management',
        'Project Management'
    ],
    links: [
        { url: 'https://www.linkedin.com/in/shaunburdick/', text: 'LinkedIn' },
        { url: 'https://github.com/shaunburdick/', text: 'GitHub' },
        { url: `mailto://${Math.floor(Math.random() * Date.now()).toString(36)}-${atob('c2l0ZS1jb250YWN0QHNoYXVuYnVyZGljay5jb20=')}`, text: 'Email' },
        { url: 'https://zcal.co/shaunburdick', text: 'Calendar' }
    ]
});

USERS.set('mario', {
    name: 'Mario Mario',
    occupation: [ 'Plumber', 'Brother', 'Emergency Contact' ],
    location: 'Level 1, Mushroom Kingdom',
    expertise: [
        'Plumbing',
        'Jumping',
        'Fireball Throwing',
        'Princess Saving',
        'Mushroom Eating',
    ],
    links: [
        { url: 'https://www.youtube.com/watch?v=6Ajhzlq42f0', text: 'Theme Song' },
    ]
});

USERS.set('badger', {
    name: 'Badger Badger Badger',
    occupation: [ 'Badger', 'Mushroom', 'Snake' ],
    location: 'The bushes of the internet',
    expertise: [
        'Badgering',
        'Mushrooming',
        'Snaking',
    ],
    links: [
        { url: 'https://www.youtube.com/watch?v=EIyixC9NsLI', text: 'Badger Badger Badger' },
    ]
});
