import app from '../server';

app.post('/signup', (req, res)=> {
	res.status(201).json('Signup Successful');
});
