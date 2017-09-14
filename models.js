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
	facebook: { type: Sequelize.TEXT },
	twitter: { type: Sequelize.TEXT },
	github: { type: Sequelize.TEXT },
	orcid: { type: Sequelize.TEXT },
	googleScholar: { type: Sequelize.TEXT },
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
	content: { type: Sequelize.JSONB },
	parentId: { type: Sequelize.UUID },

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

/*  Users can have many Discussions. Discussions belong to a single User. */
User.hasMany(Discussion, { onDelete: 'CASCADE', as: 'discussions', foreignKey: 'userId' });
Discussion.belongsTo(User, { onDelete: 'CASCADE', as: 'author', foreignKey: 'userId' });

/* Discussions can have many Labels. Labels can belong to many Discussions. */
Label.belongsToMany(Discussion, { onDelete: 'CASCADE', as: 'discussions', through: 'DiscussionLabel', foreignKey: 'labelId' });
Discussion.belongsToMany(Label, { onDelete: 'CASCADE', as: 'labels', through: 'DiscussionLabel', foreignKey: 'discussionId' });

const db = {
	User: User,
	Discussion: Discussion,
	DiscussionLabel: DiscussionLabel,
	Label: Label,
};

db.sequelize = sequelize;

module.exports = db;
