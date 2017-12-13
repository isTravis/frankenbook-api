import app from '../server';
import { Label, User } from '../models';

app.get('/admin', (req, res)=> {
	return res.status(201).json('Hello');
	// Get user and their associated labels.
	// Get all discussions under those labels
	// Return those discussions
	// In labels, add routes that let you add, remove discussionLabels
	// Add route that lets you flag a discussion - and update discussion query to only return
	// non-flagged items
	// Add admins in generateData


	// console.time('testAdmin');
	// const user = req.user;
	// const slugs = (req.params && req.params.slugs && req.params.slugs.split('+')) || [];
	// // console.log(slugs);
	// // We want to eventually also get all labels 
	// // that are owned/followed by author here. 
	// // So we can put them in dropdown.

	// Label.findAll({
	// 	where: {
	// 		$or: {
	// 			slug: { $in: slugs },
	// 			isEditorial: true,
	// 		},
	// 	},
	// 	group: ['Label.id'],
	// 	attributes: {
	// 		include: [
	// 			'id', 'title', 'slug', 'description', 'icon', 'color', 'isEditorial',
	// 			[sequelize.fn('COUNT', sequelize.col('discussionLabels.labelId')), 'discussionsCount']
	// 		],
	// 		exclude: ['createdAt', 'updatedAt']
	// 	},
	// 	include: [
	// 		{
	// 			model: DiscussionLabel,
	// 			attributes: [],
	// 			as: 'discussionLabels',
	// 		}
	// 	],
	// })
	// .then((labels)=> {
	// 	console.timeEnd('testAdmin');
	// 	const userData = user ? user.toJSON() : {};
	// 	return res.status(201).json({
	// 		labelsData: labels,
	// 		loginData: {
	// 			...userData,
	// 			createdAt: undefined,
	// 			updatedAt: undefined,
	// 			hash: undefined,
	// 			salt: undefined,
	// 		}
	// 	});
	// })
	// .catch((err)=> {
	// 	console.log(err);
	// 	return res.status(500).json(err);
	// });
});
