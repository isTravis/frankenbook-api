import app from '../server';
import postmark from 'postmark';
import generateHash from '../utilities/generateHash';
import { sequelize, Signup, User } from '../models';

const client = new postmark.Client(process.env.POSTMARK_API_KEY);

app.post('/signup', (req, res)=> {
	// First, try to update the emailSentCount.
	// If there are no records to update, then we create a new one.
	// If this fails, it is because the email must be unique and it is already used
	const email = req.body.email.toLowerCase().trim();
	User.findOne({
		where: { email: email }
	})
	.then(function(userData) {
		if (userData) { throw new Error('Email already used'); }

		return Signup.update({ count: sequelize.literal('count + 1') }, {
			where: { email: email, completed: false }
		});
	})
	.then(function(updateCount) {
		if (updateCount[0]) { 
			return null; 
		}
		return Signup.create({
			email: email,
			hash: generateHash(),
			count: 1,
			completed: false,
		});
	})
	.then(function(result) {
		return Signup.findOne({ where: { email: req.body.email } });
	})
	.then(function(signUpData) {
		return client.sendEmailWithTemplate({
			From: 'pubpub@media.mit.edu',
			To: signUpData.email,
			TemplateId: '3228461',
			TemplateModel: { 
				action_url: `${req.headers.origin}/user/create/${signUpData.hash}`
			}
		});
	})
	.then(function(result) {
		return res.status(201).json(true);
	})
	.catch(function(err) {
		console.error('Error in post signUp: ', err);
		return res.status(500).json('Email already used');
	});
});

app.get('/signup/:hash', (req, res)=> {
	Signup.findOne({ 
		where: { hash: req.params.hash, completed: false },
		attributes: ['email', 'hash'] 
	})
	.then(function(signUpData) {
		if (!signUpData) { return res.status(500).json('Hash not valid'); }
		return res.status(201).json(signUpData);
	})
	.catch(function(err) {
		console.error('Error in get signUp: ', err);
		return res.status(500).json(err.message);
	});
});
