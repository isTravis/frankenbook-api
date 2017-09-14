import app from '../server';
import { Label, Discussion, User } from '../models';

app.get('/labels/:slugs', (req, res)=> {
	console.time('testLabel');
	const slugs = req.params.slugs.split('+');
	console.log(slugs);
	Label.findAll({
		where: {
			slug: { $in: slugs }
		},
		attributes: {
			exclude: ['createdAt', 'updatedAt']
		},
		include: [
			{
				model: Discussion,
				as: 'discussions',
				through: { attributes: [] },
				include: [
					{
						model: User,
						as: 'author',
						attributes: ['id', 'avatar', 'initials', 'slug', 'fullName'],
					},
				]
			}
		],
	})
	.then((labels)=> {
		console.timeEnd('testLabel');
		return res.status(201).json(labels);
	})
	.catch((err)=> {
		return res.status(500).json(err);
	});
});
