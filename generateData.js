import Promise from 'bluebird';
import faker from 'faker';
import Color from 'color';
import { sequelize, User } from './models';

const numUsers = 500;

sequelize.sync({ force: true })
.then(()=> {
	/* Create Users */
	const emptyUsers = new Array(numUsers).fill(0);
	const users = emptyUsers.map(()=> {
		const firstName = faker.name.firstName();
		const lastName = faker.name.lastName();
		const userName = faker.internet.userName().toLowerCase();
		return {
			email: `${Math.ceil(Math.random() * 10000)}${faker.internet.email()}`.toLowerCase(),
			firstName: firstName,
			lastName: lastName,
			fullName: `${firstName} ${lastName}`,
			initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
			slug: `${firstName} ${lastName}${Math.ceil(Math.random() * 10000)}`.toLowerCase().replace(/[^a-z0-9.]+/gi, '-'),
			avatar: faker.image.avatar(),
			bio: Math.round(Math.random()) ? faker.lorem.paragraph() : undefined,
			facebook: Math.round(Math.random()) ? userName : undefined,
			twitter: Math.round(Math.random()) ? userName : undefined,
			orcid: Math.round(Math.random()) ? '0001-2320-0025-1239' : undefined,
			googleScholar: Math.round(Math.random()) ? userName : undefined,
			github: Math.round(Math.random()) ? userName : undefined,
			location: Math.round(Math.random()) ? `${faker.address.city()}, ${faker.address.state()}` : undefined,
			website: Math.round(Math.random()) ? faker.internet.url() : undefined,
			hash: '6c6b9c0da580229b733bc811af2e9198c134b8f39cfd8d9d30b198a2a675bb2469f097db57417dd4c6356245fd91b1ee584dd499671ec732b30df07aa9f2346d4f491adb0282f598157aa3ba4e5950f771952b408b85d98b618238ef216dc4848ae7e272e718d64e5acec9b8001d47cb64ec2121629c223f0bcee092bd59cc7fe82ce890903eb1810678f9b632d284736df02cd157a647cbc00578898c11bdd67f68a1804658bce45670ef2b84c35b05e0daf9fa233389f2d6fc5aef511d78240df2e9cd2da51f44e2a846d75e3c01c2700ac69a9af1ed9db96f5c95d4d5d9c2b87915acec179f4c63017da8ee5f66161df8e06326954acf0deba64852466060d687d0d1943c6407f04f8a0eb1810bfb3d01de2605ca263b263aa19e334dd0ed0168f950863b4febfcb96668aa22861484c13cd1eaa9bbce08e4993e04b538a278947eb56037c58ca85ad250901ef564b9c975b775107dc85770221598a384f056ce452b1f085a57c11b6c2e895aa989a363f02e3a77dc09a3d3d1a9f4ff58ac37053987e635b503947daf08947b5ffb53e6d43d0ce44699b3fadbd9687e755fa77e0c65107dc1dafef4e17f2f419af64aa222d28ebb4e3fd9a2a7879ed53e314c808dc731072c13fb8da853c555fd228fbc582e63498dd88e58a8a8d2617a49fd14c17b1717ca68ab8d81e381580f0ba9cad84b41b4a5b614ea47ec46a9eeda',
			salt: 'a247177499f52787e2c646c9a30d38b5e11830b5ffa2c8e627d96a308c5109d8',
		};
	});
	return User.bulkCreate(users);
})
.then(()=> {
	console.log(`Created ${numUsers} Users`);
	console.log('Done');
})
.catch((err)=> {
	console.log(err);
});

