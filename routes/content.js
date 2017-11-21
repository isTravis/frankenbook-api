import Promise from 'bluebird';
import passport from 'passport';
import app from '../server';
import { User, Signup, Content } from '../models';

app.put('/content', (req, res)=> {
	const dbQuery = req.body.id
		? Content.update({ json: req.body.json }, {
			where: { id: req.body.id }
		})
		: Content.create({
			json: req.body.json
		});

	dbQuery
	.then((queryResult)=> {
		return res.status(201).json(req.body.json);
	})
	.catch((err)=> {
		console.error('Error in putContent: ', err);
		return res.status(500).json(err);
	});
});

const getContent = (req, res)=> {
	console.time('testContent');
	const where = req.params.id
		? { id: req.params.id }
		: {};
	Content.findOne({
		where: where,
	})
	.then((content)=> {
		console.timeEnd('testContent');
		return res.status(201).json(content);
	})
	.catch((err)=> {
		return res.status(500).json(err);
	});
};

app.get('/content', getContent);
app.get('/content/:id', getContent);
