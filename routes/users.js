import app from '../server';
import { User } from '../models';

app.get('/users/:slug', (req, res)=> {
	console.time('testUser');
	User.findOne({
		where: {
			slug: req.params.slug
		},
		attributes: {
			exclude: ['salt', 'hash', 'email', 'createdAt', 'updatedAt']
		},
	})
	.then((collection)=> {
		console.timeEnd('testUser');
		return res.status(201).json(collection);
	})
	.catch((err)=> {
		return res.status(500).json(err);
	});
});
