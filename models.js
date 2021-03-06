/* eslint-disable global-require */

if (process.env.NODE_ENV !== 'production') {
	require('./config.js');
}

const Sequelize = require('sequelize');
const passportLocalSequelize = require('passport-local-sequelize');

const useSSL = process.env.DATABASE_URL.indexOf('localhost:') === -1;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
	logging: false,
	dialectOptions: { ssl: useSSL }
});

// Change to true to update the model in the database.
// NOTE: This being set to true will erase your data.
sequelize.sync({ force: false });

const id = {
	primaryKey: true,
	type: Sequelize.UUID,
	defaultValue: Sequelize.UUIDV4,
};

const Content = sequelize.define('Content', {
	id: id,
	json: { type: Sequelize.JSONB },
});

const User = sequelize.define('User', {
	id: id,
	slug: {
		type: Sequelize.TEXT,
		unique: true,
		allowNull: false,
		validate: {
			isLowercase: true,
			len: [1, 280],
			is: /^(?=.*[a-zA-Z])[a-zA-Z0-9-]+$/, // Must contain at least one letter, alphanumeric and underscores and hyphens
		},
	},
	firstName: { type: Sequelize.TEXT, allowNull: false },
	lastName: { type: Sequelize.TEXT, allowNull: false },
	fullName: { type: Sequelize.TEXT, allowNull: false },
	initials: { type: Sequelize.STRING, allowNull: false },
	avatar: { type: Sequelize.TEXT },
	bio: { type: Sequelize.TEXT },
	email: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true,
			isLowercase: true,
		}
	},
	location: { type: Sequelize.TEXT },
	website: { type: Sequelize.TEXT },
	website2: { type: Sequelize.TEXT },
	facebook: { type: Sequelize.TEXT },
	twitter: { type: Sequelize.TEXT },
	github: { type: Sequelize.TEXT },
	orcid: { type: Sequelize.TEXT },
	googleScholar: { type: Sequelize.TEXT },
	resetHashExpiration: { type: Sequelize.DATE },
	resetHash: { type: Sequelize.TEXT },
	hash: { type: Sequelize.TEXT, allowNull: false },
	salt: { type: Sequelize.TEXT, allowNull: false },
});

passportLocalSequelize.attachToUser(User, {
	usernameField: 'email',
	hashField: 'hash',
	saltField: 'salt',
	digest: 'sha1',
});

const Discussion = sequelize.define('Discussion', {
	id: id,
	anchor: { type: Sequelize.STRING, allowNull: false },
	text: { type: Sequelize.TEXT },
	content: { type: Sequelize.JSONB },
	parentId: { type: Sequelize.UUID },
	endorsed: { type: Sequelize.BOOLEAN },
	flagged: { type: Sequelize.BOOLEAN },

	/* Set by Associations */
	userId: { type: Sequelize.UUID, allowNull: false },
});

const Label = sequelize.define('Label', {
	id: id,
	title: { type: Sequelize.TEXT, allowNull: false },
	slug: {
		type: Sequelize.TEXT,
		unique: true,
		allowNull: false,
		validate: {
			isLowercase: true,
			len: [1, 280],
			is: /^(?=.*[a-zA-Z])[a-zA-Z0-9-]+$/, // Must contain at least one letter, alphanumeric and underscores and hyphens
		},
	},
	description: { type: Sequelize.TEXT },
	icon: { type: Sequelize.STRING },
	color: { type: Sequelize.STRING },
	isEditorial: { type: Sequelize.BOOLEAN },
});

const LabelAdmin = sequelize.define('LabelAdmin', {
	id: id,
	/* Set by Associations */
	userId: { type: Sequelize.UUID, allowNull: false },
	labelId: { type: Sequelize.UUID, allowNull: false },
});

const DiscussionLabel = sequelize.define('DiscussionLabel', {
	id: id,

	/* Set by Associations */
	discussionId: { type: Sequelize.UUID, allowNull: false },
	labelId: { type: Sequelize.UUID, allowNull: false },
}, {
	indexes: [
		{ fields: ['labelId'], method: 'BTREE' },
		{ fields: ['discussionId'], method: 'BTREE' },
	]
});

const Signup = sequelize.define('Signup', {
	id: id,
	email: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true,
			isLowercase: true,
		}
	},
	hash: { type: Sequelize.TEXT },
	count: { type: Sequelize.INTEGER },
	completed: { type: Sequelize.BOOLEAN },
});

/* Labels can have many Admins. Users can admin many labels. */
User.belongsToMany(Label, { onDelete: 'CASCADE', as: 'labels', through: 'LabelAdmin', foreignKey: 'userId' });
Label.belongsToMany(User, { onDelete: 'CASCADE', as: 'admins', through: 'LabelAdmin', foreignKey: 'labelId' });

/*  Users can have many Discussions. Discussions belong to a single User. */
User.hasMany(Discussion, { onDelete: 'CASCADE', as: 'discussions', foreignKey: 'userId' });
Discussion.belongsTo(User, { onDelete: 'CASCADE', as: 'author', foreignKey: 'userId' });

/* Discussions can have many Labels. Labels can belong to many Discussions. */
Label.belongsToMany(Discussion, { onDelete: 'CASCADE', as: 'discussions', through: 'DiscussionLabel', foreignKey: 'labelId' });
Discussion.belongsToMany(Label, { onDelete: 'CASCADE', as: 'labels', through: 'DiscussionLabel', foreignKey: 'discussionId' });

/* Added so we can query count of discussions from Label */
Label.hasMany(DiscussionLabel, { onDelete: 'CASCADE', as: 'discussionLabels', foreignKey: 'labelId' });

Discussion.hasMany(Discussion, { onDelete: 'CASCADE', as: 'replies', foreignKey: 'parentId' });

const db = {
	Content: Content,
	Discussion: Discussion,
	DiscussionLabel: DiscussionLabel,
	Label: Label,
	LabelAdmin: LabelAdmin,
	Signup: Signup,
	User: User,
};

db.sequelize = sequelize;

module.exports = db;
