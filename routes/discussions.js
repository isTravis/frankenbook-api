import app from '../server';
import { Label, Discussion, User } from '../models';

app.get('/discussions/:labelSlugs', (req, res)=> {
	console.time('testDiscussionsQuery');
	const slugs = req.params.labelSlugs.split('+');
	Discussion.findAll({
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
