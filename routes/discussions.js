import Promise from 'bluebird';
import app from '../server';
import { Label, Discussion, DiscussionLabel, User } from '../models';

app.post('/discussions', (req, res)=> {
	const user = req.user;

	Discussion.create({
		anchor: req.body.anchor,
		content: req.body.content,
		text: req.body.text,
		parentId: req.body.parentId,
		userId: req.body.userId,
	})
	.then((newDiscussion)=> {
		const generateLabel = newDiscussion.parentId
			? null
			: DiscussionLabel.create({
				labelId: 'fff8d9aa-fda5-48f1-a3e4-a8ef10c7d257',
				discussionId: newDiscussion.id
			});
		return Promise.all([newDiscussion, generateLabel]);
	})
	.then(([newDiscussion])=> {
		if (!newDiscussion.parentId) {
			return Discussion.findOne({
				where: {
					id: newDiscussion.id,
				},
				include: [
					{
						model: Label,
						as: 'labels',
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'description']
						},
						through: { attributes: [] },
					},
					{
						model: User,
						as: 'author',
						attributes: ['id', 'avatar', 'initials', 'slug', 'fullName'],
					},
					{
						model: Discussion,
						as: 'replies',
						separate: true,
					}

				]
			});
		}
		return newDiscussion;
	})
	.then((newDiscussion)=> {
		return res.status(201).json({
			...newDiscussion.toJSON(),
			author: {
				id: user.id,
				avatar: user.avatar,
				initials: user.initials,
				slug: user.slug,
				fullName: user.fullName,
			}
		});
	})
	.catch((err)=> {
		console.log(err);
		return res.status(500).json(err);
	});
});

app.put('/discussions', (req, res)=> {
	const user = req.user || {};

	// Filter to only allow certain fields to be updated
	const updatedDiscussion = {};
	Object.keys(req.body).forEach((key)=> {
		if (['content', 'text'].indexOf(key) > -1) {
			updatedDiscussion[key] = req.body[key] && req.body[key].trim
				? req.body[key].trim()
				: req.body[key];
		}
	});
	updatedDiscussion.updatedAt = new Date();

	return Discussion.update(updatedDiscussion, {
		where: {
			id: req.body.id,
			userId: user.id,
		}
	})
	.then(()=> {
		return res.status(201).json({
			...updatedDiscussion,
			id: req.body.id
		});
	})
	.catch((err)=> {
		console.log('Error putting Discussion', err);
		return res.status(500).json(err);
	});
});

app.get('/discussions/:labelSlugs', (req, res)=> {
	console.time('testDiscussionsQuery');
	const slugs = req.params.labelSlugs.split('+');
	Discussion.findAll({
		where: {
			parentId: null,
			flagged: { $not: true }
		},
		include: [
			{
				model: Label,
				as: 'labels',
				where: {
					slug: { $in: slugs }
				},
				attributes: {
					exclude: ['createdAt', 'updatedAt', 'description']
				},
				through: { attributes: [] },
			},
			{
				model: User,
				as: 'author',
				attributes: ['id', 'avatar', 'initials', 'slug', 'fullName'],
			},
			{
				model: Discussion,
				as: 'replies',
				where: {
					flagged: { $not: true }
				},
				separate: true,
				include: [
					{
						model: User,
						as: 'author',
						attributes: ['id', 'avatar', 'initials', 'slug', 'fullName'],
					},
				]
			}

		]
	})
	.then((discussions)=> {
		console.timeEnd('testDiscussionsQuery');
		return res.status(201).json(discussions);
	})
	.catch((err)=> {
		console.log(err);
		return res.status(500).json(err);
	});
});
