import { User } from '../models';
import jsonUserData from './userData.json';

const userDataByFullName = {};
const jsonDataByFullName = {};

User.findAll({
	attributes: ['id', 'fullName'],
})
.then((dbUserData)=> {
	dbUserData.forEach((user)=> {
		userDataByFullName[user.fullName.replace(/ /gi, '-').toLowerCase()] = user.toJSON();
	});
	jsonUserData.forEach((user)=> {
		jsonDataByFullName[user.Name.replace(/ /gi, '-').replace(/\./gi, '').toLowerCase()] = user;
	});
	// console.log(userDataByFullName, jsonDataByFullName);
	// const uniqueInDb = userDataByFullName.filter((name)=> {
	// 	if (jsonDataByFullName.indexOf(name) === -1) { return true; }
	// 	return false;
	// });
	const uniqueInJson = Object.keys(jsonDataByFullName).filter((name)=> {
		if (Object.keys(userDataByFullName).indexOf(name) === -1) { return true; }
		return false;
	});
	const notUniqueInJson = Object.keys(jsonDataByFullName).filter((name)=> {
		if (Object.keys(userDataByFullName).indexOf(name) !== -1) { return true; }
		return false;
	});
	// console.log(notUniqueInJson, uniqueInJson);
	/* So we need to create the uniqueInJSON */
	/* All the entries not unique in json have corresponding ids */
	const updatePromises = notUniqueInJson.map((item)=> {
		return User.update({
			bio: jsonDataByFullName[item].Bio,
			website: jsonDataByFullName[item]['Web Link 1'],
			website2: jsonDataByFullName[item]['Web Link 2'],
			location: null,
			facebook: null,
			twitter: null,
			github: null,
			orcid: null,
			googleScholar: null,
		}, {
			where: {
				id: userDataByFullName[item].id,
			},
		});
	});
	const createPromises = uniqueInJson.map((item)=> {
		const firstName = jsonDataByFullName[item].Name.split(' ')[0];
		const lastName = jsonDataByFullName[item].Name.split(' ').slice(1, 10).join(' ');
		const slug = jsonDataByFullName[item].Name.replace(/ /gi, '-').replace(/\./gi, '').toLowerCase();
		return User.create({
			fullName: jsonDataByFullName[item].Name,
			firstName: firstName,
			lastName: lastName,
			initials: `${firstName[0]}${lastName[0]}`,
			slug: slug,
			email: `${slug}@fake.com`,
			bio: jsonDataByFullName[item].Bio,
			website: jsonDataByFullName[item]['Web Link 1'],
			website2: jsonDataByFullName[item]['Web Link 2'],
			hash: 'b58f80b39ea3d6ee8ff3e9cce8aa92f772599d49e62e5b7057c84d2a64ea148a90c5b660699bf69fbff9c285e1bd4fa3cacf75a11a5e66784cedf0821f71ac556fa7a2612439f5dc26badc66b59b626553bbd739b3286612fde389c56c74dec53ff82938f1b61de79b9ce888421753d0c6e5f851e6374f31637255b2113084c074a33d26a137459415ccbdb530b5a1734dad2aaabc31c6d1e12d4107f7dc84efa23fb0e5b5523dc044297cb7117cc5ea4ffcef1a4b65a9d92d0597ae6f909d307bfbfa56597ea7b82c017ea19d4ef93cf1b762f5f253c4fefad8c98fc864596be32b39a51b0d9ba1949af5752a561c6b2a5d0f6e5e51608a946201e1d033da663741fa8c1d8db8792affa4e16e5b0eddaa9e344f543526e17f04341755d7d86cd45cd71ad16a562fd78d97742775c30f30bcac4cfab7b0f6812760d7163a48308988f9adee9c8484649068c4e1ef74df255951cd13de70ebf5213e2e75b5ab9ed6ccbe26cde5ff0074b0ea17b8a49bec8a06d95e55e1b2712ea62196b8f7df40996208038fbe055874a262f50133b00947efb0a40d4238be5df88f5690ccc8c8a2a07f15db0d146713e4d96835ded09b85f7f091040ff982f58c83cc4dfa560fdd5480750e96526172e8d7f417c5ae8482230f0aefe50beb0f85c4395d3800782f5f28e5b3d6887b257557159b1d70e5e6a62fe61c8fcc361f1fb827e22b7498',
			salt: '42f20201f1b9bb9fff0c8808b48815c58bded0bef374f73cd7c0b2f8e3d988f1',
		});
	});
	return Promise.all([...updatePromises, ...createPromises]);
})
.then(()=> {
	console.log('Completed');
})
.catch((err)=> {
	console.log('Error: ', err);
})
.finally(()=> {
	process.exit();
});
