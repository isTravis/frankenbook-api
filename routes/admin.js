import Promise from 'bluebird';
import app from '../server';
import { Label, User, Discussion, LabelAdmin, DiscussionLabel } from '../models';

app.get('/admin', (req, res)=> {
	// In labels, add routes that let you add, remove discussionLabels
	// Add route that lets you flag a discussion - and update discussion query to only return
	// non-flagged items

	console.time('testAdmin');
	const user = req.user || {};
	if (!user.id) { return res.status(201).json('Not Logged In'); }

	User.findOne({
		where: {
			id: user.id
		},
		include: [
			{
				model: Label,
				as: 'labels',
				through: { attributes: [] },
				include: [
					{
						model: Discussion,
						as: 'discussions',
						through: { attributes: [] },
						include: [
							{
								model: Label,
								as: 'labels',
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
							{
								model: Discussion,
								as: 'replies',
								separate: true,
								include: [
									{
										model: User,
										as: 'author',
										attributes: ['id', 'avatar', 'initials', 'slug', 'fullName'],
									},
								]
							}

						]
					}
				]
			}
		],
	})
	.then((userData)=> {
		console.timeEnd('testAdmin');
		console.time('testAdminProcess');
		const flatDiscussions = [];
		const usedDiscussions = {};
		const labels = userData.toJSON().labels || [];
		labels.forEach((label)=> {
			const discussions = label.discussions || [];
			discussions.forEach((discussion)=> {
				const withoutReplies = {
					...discussion,
					replies: undefined,
				};
				if (!usedDiscussions[withoutReplies.id]) {
					usedDiscussions[withoutReplies.id] = true;
					flatDiscussions.push(withoutReplies);
				}
				const replies = discussion.replies || [];
				replies.forEach((reply)=> {
					if (!usedDiscussions[reply.id]) {
						usedDiscussions[reply.id] = true;
						flatDiscussions.push(reply);
					}
				});
			});
		});

		const outputLabels = labels.map((label)=> {
			return {
				...label,
				discussions: undefined,
				discussionsCount: label.discussions.length,
			};
		});
		console.timeEnd('testAdminProcess');
		return res.status(201).json({
			labels: outputLabels,
			discussions: flatDiscussions,
		});
	})
	.catch((err)=> {
		console.log('Error in getAdmin', err);
		return res.status(500).json(err);
	});
});

app.put('/admin/discussions', (req, res)=> {
	const user = req.user || {};

	/* We need to authenticate that 
		1) The label is something this user can administrate, and
		2) The discussion in question is a part of that label
	*/
	const findLabelAdmin = LabelAdmin.findAll({
		where: {
			userId: user.id,
		}
	});
	const findDiscussionLabel = DiscussionLabel.findAll({
		where: {
			discussionId: req.body.parentId || req.body.discussionId,
		}
	});
	return Promise.all([findLabelAdmin, findDiscussionLabel])
	.then(([labelAdminData, discussionLabelData])=> {
		const labelAdminIds = labelAdminData.map((item)=> { return item.labelId; });
		const discussionLabelIds = discussionLabelData.map((item)=> { return item.labelId; });
		const canAdminDiscussion = labelAdminIds.some(elem => discussionLabelIds.includes(elem));

		if (!canAdminDiscussion) {
			throw new Error('Not authenticated to admin this discussion');
		}
		// Filter to only allow certain fields to be updated
		const updatedDiscussion = {};
		Object.keys(req.body).forEach((key)=> {
			if (['flagged', 'endorsed'].indexOf(key) > -1) {
				updatedDiscussion[key] = req.body[key];
			}
		});
		const updateDiscussion = Discussion.update(updatedDiscussion, {
			where: {
				id: req.body.discussionId,
			}
		});
		return Promise.all([updatedDiscussion, updateDiscussion]);
	})
	.then(([updatedDiscussion])=> {
		return res.status(201).json({
			...updatedDiscussion,
			id: req.body.discussionId
		});
	})
	.catch((err)=> {
		console.log('Error in put adminDiscussion', err);
		return res.status(500).json(err);
	});
});

app.post('/admin/discussionLabels', (req, res)=> {
	const user = req.user || {};

	/* We need to authenticate that the label is something this user can administrate */
	const findLabelAdmin = LabelAdmin.findOne({
		where: {
			labelId: req.body.labelId,
			userId: user.id,
		}
	});
	return findLabelAdmin
	.then((labelAdminData)=> {
		if (!labelAdminData) {
			throw new Error('Not authenticated to admin this label');
		}
		return DiscussionLabel.create({
			discussionId: req.body.discussionId,
			labelId: req.body.labelId,
		});
	})
	.then(()=> {
		return Label.findOne({
			where: {
				id: req.body.labelId,
			},
			attributes: ['id', 'title', 'slug', 'icon', 'color']
		});
	})
	.then((labelData)=> {
		return res.status(201).json({
			discussionId: req.body.discussionId,
			labelData: labelData,
		});
	})
	.catch((err)=> {
		console.log('Error in put adminDiscussion', err);
		return res.status(500).json(err);
	});
});

app.delete('/admin/discussionLabels', (req, res)=> {
	const user = req.user || {};

	/* We need to authenticate that the label is something this user can administrate */
	const findLabelAdmin = LabelAdmin.findOne({
		where: {
			labelId: req.body.labelId,
			userId: user.id,
		}
	});
	return findLabelAdmin
	.then((labelAdminData)=> {
		if (!labelAdminData) {
			throw new Error('Not authenticated to admin this label');
		}
		return DiscussionLabel.destroy({
			where: {
				discussionId: req.body.discussionId,
				labelId: req.body.labelId,
			}
		});
	})
	.then(()=> {
		return res.status(201).json({
			discussionId: req.body.discussionId,
			labelId: req.body.labelId,
		});
	})
	.catch((err)=> {
		console.log('Error in put adminDiscussion', err);
		return res.status(500).json(err);
	});
});
