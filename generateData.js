import Promise from 'bluebird';
import faker from 'faker';
import uuidv4 from 'uuid/v4';
import { sequelize, User, Discussion, Label, DiscussionLabel } from './models';

const annotationsJSON = require('../site/static/sourceAnnotations.json');
// console.log(annotationsJSON);

const maxLabels = 4;

const authors = annotationsJSON.reduce((prev, curr)=> {
	if (curr.author) {
		const fullName = curr.author.replace('.', '');
		const firstName = fullName.split(' ')[0];
		const lastName = fullName.split(' ').slice(1, fullName.split(' ').length).join(' ');
		const slug = fullName.replace(/\s/gi, '-').toLowerCase();
		prev[curr.author] = {
			id: uuidv4(),
			fullName: fullName,
			firstName: firstName,
			lastName: lastName,
			initials: `${firstName[0]}${lastName[0]}`,
			slug: slug,
			email: `${slug}@fake.com`,
			hash: '6c6b9c0da580229b733bc811af2e9198c134b8f39cfd8d9d30b198a2a675bb2469f097db57417dd4c6356245fd91b1ee584dd499671ec732b30df07aa9f2346d4f491adb0282f598157aa3ba4e5950f771952b408b85d98b618238ef216dc4848ae7e272e718d64e5acec9b8001d47cb64ec2121629c223f0bcee092bd59cc7fe82ce890903eb1810678f9b632d284736df02cd157a647cbc00578898c11bdd67f68a1804658bce45670ef2b84c35b05e0daf9fa233389f2d6fc5aef511d78240df2e9cd2da51f44e2a846d75e3c01c2700ac69a9af1ed9db96f5c95d4d5d9c2b87915acec179f4c63017da8ee5f66161df8e06326954acf0deba64852466060d687d0d1943c6407f04f8a0eb1810bfb3d01de2605ca263b263aa19e334dd0ed0168f950863b4febfcb96668aa22861484c13cd1eaa9bbce08e4993e04b538a278947eb56037c58ca85ad250901ef564b9c975b775107dc85770221598a384f056ce452b1f085a57c11b6c2e895aa989a363f02e3a77dc09a3d3d1a9f4ff58ac37053987e635b503947daf08947b5ffb53e6d43d0ce44699b3fadbd9687e755fa77e0c65107dc1dafef4e17f2f419af64aa222d28ebb4e3fd9a2a7879ed53e314c808dc731072c13fb8da853c555fd228fbc582e63498dd88e58a8a8d2617a49fd14c17b1717ca68ab8d81e381580f0ba9cad84b41b4a5b614ea47ec46a9eeda',
			salt: 'a247177499f52787e2c646c9a30d38b5e11830b5ffa2c8e627d96a308c5109d8',
		};
	}
	return prev;
}, {});
// console.log(authors);

sequelize.sync({ force: true })
.then(()=> {
	/* Create Users */
	const users = Object.keys(authors).map((item)=> {
		return authors[item];
	});
	return User.bulkCreate(users);
})
.then(()=> {
	console.log('Created Users');
	const discussions = annotationsJSON.filter((item)=> {
		return item.author;
	}).map((item)=> {
		return {
			userId: authors[item.author].id,
			content: item.content,
			anchor: item.anchor,
		};
	});
	return Discussion.bulkCreate(discussions);
})
.then(()=> {
	console.log('Created Discussions');

	const labels = [
		{
			title: 'Technology',
			slug: 'technology',
			description: 'Emerging Frankensteinian technologies, from AI to geoengineering, plus historical technologies connected to the novel.',
			icon: 'tech',
			color: '#c0392b',
			isEditorial: true,
		},
		{
			title: 'Science',
			slug: 'science',
			description: 'Natural science today and in the past, from ancients and alchemists to Romantic scientists like Davy, Lamarck, and the Herschels.',
			icon: 'science',
			color: '#d35400',
			isEditorial: true,
		},
		{
			title: 'Health & Medicine',
			slug: 'healthmed',
			description: 'Digging into Frankenstein’s preoccupation with health, disease, and the body.',
			icon: 'health',
			color: '#8e44ad',
			isEditorial: true,
		},
		{
			title: 'Philosophy & Politics',
			slug: 'philpol',
			description: 'From Locke and Rousseau to Sartre and Nussbaum, the big ideas that animate Frankenstein, and that help us reframe and reinterpret the novel today.',
			icon: 'philosophy',
			color: '#2980b9',
			isEditorial: true,
		},
		{
			title: 'Mary Shelley',
			slug: 'mary',
			description: 'The woman at the heart of it all: Mary Shelley’s life; her trials, travails, and adventures; her friends and family; and her literary oeuvre.',
			icon: 'shelley',
			color: '#16a085',
			isEditorial: true,
		},
		{
			title: 'Influences & Adaptations',
			slug: 'infladap',
			description: 'Which stories, novels, and poems influenced Shelley when she was writing Frankenstein? How has Frankenstein echoed and proliferated throughout pop culture and public discourse over the past 200 years?',
			icon: 'influence',
			color: '#27ae60',
			isEditorial: true,
		},
		{
			title: 'Equity & Inclusion',
			slug: 'equitincl',
			description: 'Frankenstein is a poignant story about the pain and destruction wrought by prejudice and social exclusion, written by a woman living in a deeply inequitable culture. How does the novel illuminate these issues, and how have people continued to deploy Frankenstein as a symbol in the struggle for justice?  ',
			icon: 'equity',
			color: '#1abc9c',
			isEditorial: true,
		},
		{
			title: 'Motivations & Sentiments',
			slug: 'motivments',
			description: 'The emotions, values, ideals, and obsessions that drive human ingenuity, from the tortured and inspired character of Victor Frankenstein, to the Romantic scientists of Mary Shelley’s day, to the creators and innovators of the twenty-first century.',
			icon: 'motivations',
			color: '#3498db',
			isEditorial: true,
		}

	];
	return Label.bulkCreate(labels);
})
.then(()=> {
	console.log('Created Labels');
	return Discussion.findAll({ attributes: ['id'] })
	.then((discussions)=> {
		const createDiscussionLabels = discussions.map((discussion)=> {
			return Label.findAll({ order: [sequelize.fn('RANDOM')], limit: Math.ceil(Math.random() * maxLabels) })
			.then((labels)=> {
				const creations = labels.map((label)=> {
					return {
						discussionId: discussion.id,
						labelId: label.id,
					};
				});
				return DiscussionLabel.bulkCreate(creations);
			});
		});
		return Promise.all(createDiscussionLabels);
	});
})
.then(()=> {
	console.log('Created DiscussionLabels');
	console.log('Done');
})
.catch((err)=> {
	console.log(err);
});

