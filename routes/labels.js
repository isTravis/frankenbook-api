import app from '../server';
import { Label, DiscussionLabel, sequelize } from '../models';

// app.get('/labels/:slugs', (req, res)=> {
// app.get('/labels/:slugs', (req, res)=> {
function getLabels(req, res) {
	console.time('testLabel');
	const user = req.user;
	const slugs = (req.params && req.params.slugs && req.params.slugs.split('+')) || [];
	// console.log(slugs);
	// We want to eventually also get all labels 
	// that are owned/followed by author here. 
	// So we can put them in dropdown.

	Label.findAll({
		where: {
			$or: {
				slug: { $in: slugs },
				isEditorial: true,
			},
		},
		group: ['Label.id'],
		attributes: {
			include: [
				'id', 'title', 'slug', 'description', 'icon', 'color', 'isEditorial',
				[sequelize.fn('COUNT', sequelize.col('discussionLabels.labelId')), 'discussionsCount']
			],
			exclude: ['createdAt', 'updatedAt']
		},
		include: [
			{
				model: DiscussionLabel,
				attributes: [],
				as: 'discussionLabels',
			}
		],
	})
	.then((labels)=> {
		console.timeEnd('testLabel');
		return res.status(201).json({
			labelsData: labels,
			loginData: user
		});
	})
	.catch((err)=> {
		console.log(err);
		return res.status(500).json(err);
	});
}

app.get('/labels', getLabels);
app.get('/labels/:slugs', getLabels);
