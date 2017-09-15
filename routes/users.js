import Promise from 'bluebird';
import passport from 'passport';
import app from '../server';
import { User, Signup, Discussion } from '../models';

app.post('/users', (req, res)=> {
	// Check that hash and email sync up
	// Create user
	// Update SignUp to 'completed'
	// Get and return authenticated user data
	const email = req.body.email.toLowerCase().trim();
	console.log('Hello');
	Signup.findOne({
		where: { hash: req.body.hash, email: req.body.email.toLowerCase() },
		attributes: ['email', 'hash', 'completed']
	})
	.then((signUpData)=> {
		if (!signUpData) { throw new Error('Hash not valid'); }
		if (signUpData.completed) { throw new Error('Account already created'); }
		return true;
	})
	.then(()=> {
		const firstName = req.body.firstName.trim();
		const lastName = req.body.lastName.trim();
		const fullName = `${firstName} ${lastName}`;
		const initials = `${firstName[0]}${lastName[0]}`;

		const newUser = {
			slug: fullName.replace(/\s/gi, '-').toLowerCase(),
			firstName: firstName,
			lastName: lastName,
			fullName: fullName,
			initials: initials,
			email: email,
		};

		const userRegister = Promise.promisify(User.register, { context: User });
		return userRegister(newUser, req.body.password);
	})
	.then(()=> {
		return Signup.update({ completed: true }, {
			where: { email: email, hash: req.body.hash, completed: false },
		});
	})
	.then(()=> {
		passport.authenticate('local')(req, res, ()=> {
			return res.status(201).json({
				...req.user.toJSON(),
				createdAt: undefined,
				updatedAt: undefined,
				hash: undefined,
				salt: undefined,
			});
		});
	})
	.catch((err)=> {
		console.error('Error in postUser: ', err);
		return res.status(500).json(err);
	});
});

app.get('/users/:slug', (req, res)=> {
	console.time('testUser');
	User.findOne({
		where: {
			slug: req.params.slug
		},
		attributes: {
			exclude: ['salt', 'hash', 'email', 'createdAt', 'updatedAt']
		},
		include: [
			{
				model: Discussion,
				as: 'discussions'
			}
		]
	})
	.then((collection)=> {
		console.timeEnd('testUser');
		return res.status(201).json(collection);
	})
	.catch((err)=> {
		return res.status(500).json(err);
	});
});
