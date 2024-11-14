import { ConsoleLine } from './ConsoleOutput';

export interface User {
    name: string;
    image?: string;
    occupation?: string[],
    location?: string,
    expertise?: string[],
    links?: {
        url: string;
        text: string;
    }[]
}

/**
 * A map of users known on the system
 */
export const USERS = new Map<string, User>();

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
