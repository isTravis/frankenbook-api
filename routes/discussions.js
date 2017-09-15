import app from '../server';
import { Label, Discussion, User } from '../models';

app.post('/discussions', (req, res)=> {
	const user = req.user;

	Discussion.create({
		anchor: req.body.anchor,
		content: req.body.content,
		parentId: req.body.parentId,
		userId: req.body.userId,
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

app.get('/discussions/:labelSlugs', (req, res)=> {
	console.time('testDiscussionsQuery');
	const slugs = req.params.labelSlugs.split('+');
	Discussion.findAll({
		where: {
			parentId: null,
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
