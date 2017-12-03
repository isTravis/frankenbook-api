// import Promise from 'bluebird';
import faker from 'faker';
import uuidv4 from 'uuid/v4';
import { sequelize, User, Discussion, Label, DiscussionLabel, Content } from './models';

const bookSourceJSON = require('../site/static/bookSourceEditor.json');
const annotationsJSON = require('../site/static/sourceAnnotationsEditor.json');

const annotationsJSONWithIds = annotationsJSON.map((item)=> {
	return { ...item, id: uuidv4() };
});

const labels = [
	{
		id: uuidv4(),
		conversionKey: 'Tech',
		title: 'Technology',
		slug: 'technology',
		description: 'Historical and emerging Frankensteinian technologies, from steam engines to AI.',
		icon: 'tech',
		color: '#D34F27',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'Science',
		title: 'Science',
		slug: 'science',
		description: 'Natural science yesterday and today, from ancients and alchemists to Humphry Davy to Marie Curie.',
		icon: 'science',
		color: '#E29E25',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'HandM',
		title: 'Health & Medicine',
		slug: 'healthmed',
		description: 'Digging into Frankenstein’s preoccupation with health, disease, and the body.',
		icon: 'health',
		color: '#184B60',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'PandP',
		title: 'Philosophy & Politics',
		slug: 'philpol',
		description: 'The big ideas and political debates that animate Frankenstein and help us understand it today.',
		icon: 'philosophy',
		color: '#52BE94',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'Shelley',
		title: 'Mary Shelley',
		slug: 'mary',
		description: 'The woman at the heart of it all: Mary Shelley’s adventures, relationships, and writing. ',
		icon: 'shelley',
		color: '#66AECD',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'IandA',
		title: 'Influences & Adaptations',
		slug: 'infladap',
		description: 'The stories that influenced Shelley, and how Frankenstein has echoed throughout culture over the past 200 years.',
		icon: 'influence',
		color: '#471A0D',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'EandI',
		title: 'Equity & Inclusion',
		slug: 'equitincl',
		description: 'Prejudice, social exclusion, and struggles for justice in the novel, in the Romantic Era, and today.',
		icon: 'equity',
		color: '#A74F83',
		isEditorial: true,
	},
	{
		id: uuidv4(),
		conversionKey: 'MandS',
		title: 'Motivations & Sentiments',
		slug: 'motivments',
		description: 'The emotions, values, ideals, and obsessions that drive human ingenuity.',
		icon: 'motivations',
		color: '#2B7557',
		isEditorial: true,
	}

];

function findLabelId(key) {
	const output = labels.reduce((prev, curr)=> {
		if (curr.conversionKey === key) { return curr.id; }
		return prev;
	}, '');
	if (!output) { console.log('What happened with that label?!', key); }
	return output;
}

const maxLabels = 4;
const maxReplies = 5;

const authors = annotationsJSONWithIds.reduce((prev, curr)=> {
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
	return Content.create({ json: bookSourceJSON });
})
.then(()=> {
	console.log('Created Content');
	/* Create Users */
	const users = Object.keys(authors).map((item)=> {
		return authors[item];
	});
	return User.bulkCreate(users);
})
.then(()=> {
	console.log('Created Users');
	const discussions = annotationsJSONWithIds.filter((item)=> {
		return item.author;
	}).map((item)=> {
		return {
			id: item.id,
			userId: authors[item.author].id,
			content: item.content,
			anchor: item.anchor,
			createdAt: new Date('2017-01-01T00:00:00+00:00'),
		};
	});
	return Discussion.bulkCreate(discussions);
})
.then(()=> {
	console.log('Created Discussions');
	return Label.bulkCreate(labels);
})
.then(()=> {
	console.log('Created Labels');
	const createDiscussionLabels = [];
	annotationsJSONWithIds.filter((item)=> {
		return item.author;
	})
	.forEach((discussion)=> {
		if (discussion.labels) {
			const labelsKeys = discussion.labels.split(',');
			labelsKeys.forEach((labelKey)=> {
				// console.log(discussion.id, findLabelId(labelKey));
				createDiscussionLabels.push({
					discussionId: discussion.id,
					labelId: findLabelId(labelKey)
				});
			});
		}
	});
	// return true;
	return DiscussionLabel.bulkCreate(createDiscussionLabels);
	// return Discussion.findAll({ attributes: ['id'] })
	// .then((discussions)=> {
	// 	const createDiscussionLabels = [];
	// 	discussions.forEach((discussion)=> {
	// 		if (discussion.labels) {


	// 			const labelsKeys = discussion.labels.split(',');
	// 			return {
	// 				discussionId: discussion.id,
	// 				labelId: findLabelId(discussion)
	// 			}
	// 		}

	// 		return Label.findAll({ order: [sequelize.fn('RANDOM')], limit: Math.ceil(Math.random() * maxLabels) })
	// 		.then((labels)=> {
	// 			const creations = labels.map((label)=> {
	// 				return {
	// 					discussionId: discussion.id,
	// 					labelId: label.id,
	// 				};
	// 			});
	// 			return DiscussionLabel.bulkCreate(creations);
	// 		});
	// 	});
	// 	return Promise.all(createDiscussionLabels);
	// });
})
.then(()=> {
	console.log('Created DiscussionLabels');
	return true;
	// return Discussion.findAll({ attributes: ['id', 'anchor'] })
	// .then((discussions)=> {
	// 	const createDiscussionReplies = discussions.map((discussion)=> {
	// 		return User.findAll({ order: [sequelize.fn('RANDOM')], limit: Math.ceil(Math.random() * maxReplies) })
	// 		.then((replyAuthors)=> {
	// 			const creations = replyAuthors.map((author)=> {
	// 				return {
	// 					anchor: discussion.anchor,
	// 					content: { type: 'text', content: faker.lorem.paragraph() },
	// 					parentId: discussion.id,
	// 					userId: author.id,
	// 					createdAt: new Date() - (Math.random() * 1000000000),
	// 				};
	// 			});
	// 			return Discussion.bulkCreate(creations);
	// 		});
	// 	});
	// 	return Promise.all(createDiscussionReplies);
	// });
})
.then(()=> {
	// console.log('Created Replies');
	console.log('Done');
})
.catch((err)=> {
	console.log(err);
});

