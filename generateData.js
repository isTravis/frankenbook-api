import Promise from 'bluebird';
import faker from 'faker';
import uuidv4 from 'uuid/v4';
import { sequelize, User, Discussion, Label, DiscussionLabel } from './models';

const annotationsJSON = require('../site/static/sourceAnnotations.json');
// console.log(annotationsJSON);

const maxLabels = 4;
const maxReplies = 5;

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
			bio: Math.round(Math.random()) ? faker.lorem.paragraph() : undefined,
			facebook: Math.round(Math.random()) ? slug : undefined,
			twitter: Math.round(Math.random()) ? slug : undefined,
			orcid: Math.round(Math.random()) ? '0001-2320-0025-1239' : undefined,
			googleScholar: Math.round(Math.random()) ? slug : undefined,
			github: Math.round(Math.random()) ? slug : undefined,
			location: Math.round(Math.random()) ? `${faker.address.city()}, ${faker.address.state()}` : undefined,
			website: Math.round(Math.random()) ? faker.internet.url() : undefined,
			hash: 'b58f80b39ea3d6ee8ff3e9cce8aa92f772599d49e62e5b7057c84d2a64ea148a90c5b660699bf69fbff9c285e1bd4fa3cacf75a11a5e66784cedf0821f71ac556fa7a2612439f5dc26badc66b59b626553bbd739b3286612fde389c56c74dec53ff82938f1b61de79b9ce888421753d0c6e5f851e6374f31637255b2113084c074a33d26a137459415ccbdb530b5a1734dad2aaabc31c6d1e12d4107f7dc84efa23fb0e5b5523dc044297cb7117cc5ea4ffcef1a4b65a9d92d0597ae6f909d307bfbfa56597ea7b82c017ea19d4ef93cf1b762f5f253c4fefad8c98fc864596be32b39a51b0d9ba1949af5752a561c6b2a5d0f6e5e51608a946201e1d033da663741fa8c1d8db8792affa4e16e5b0eddaa9e344f543526e17f04341755d7d86cd45cd71ad16a562fd78d97742775c30f30bcac4cfab7b0f6812760d7163a48308988f9adee9c8484649068c4e1ef74df255951cd13de70ebf5213e2e75b5ab9ed6ccbe26cde5ff0074b0ea17b8a49bec8a06d95e55e1b2712ea62196b8f7df40996208038fbe055874a262f50133b00947efb0a40d4238be5df88f5690ccc8c8a2a07f15db0d146713e4d96835ded09b85f7f091040ff982f58c83cc4dfa560fdd5480750e96526172e8d7f417c5ae8482230f0aefe50beb0f85c4395d3800782f5f28e5b3d6887b257557159b1d70e5e6a62fe61c8fcc361f1fb827e22b7498',
			salt: '42f20201f1b9bb9fff0c8808b48815c58bded0bef374f73cd7c0b2f8e3d988f1',
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
			createdAt: new Date() - (Math.random() * 1000000000) - 1000000000,
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
	return Discussion.findAll({ attributes: ['id', 'anchor'] })
	.then((discussions)=> {
		const createDiscussionReplies = discussions.map((discussion)=> {
			return User.findAll({ order: [sequelize.fn('RANDOM')], limit: Math.ceil(Math.random() * maxReplies) })
			.then((replyAuthors)=> {
				const creations = replyAuthors.map((author)=> {
					return {
						anchor: discussion.anchor,
						content: { type: 'text', content: faker.lorem.paragraph() },
						parentId: discussion.id,
						userId: author.id,
						createdAt: new Date() - (Math.random() * 1000000000),
					};
				});
				return Discussion.bulkCreate(creations);
			});
		});
		return Promise.all(createDiscussionReplies);
	});
})
.then(()=> {
	console.log('Created Replies');
	console.log('Done');
})
.catch((err)=> {
	console.log(err);
});

