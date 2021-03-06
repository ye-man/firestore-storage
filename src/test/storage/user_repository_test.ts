import {TestFactory, User, UserRepository} from '../index';
import * as should from 'should';

describe('UserRepository', function () {

	const tc = TestFactory.createWithRepository(this, UserRepository);
	const userRepo = tc.resolve(UserRepository);

	const save = async (count: number, cb?: (index: number) => User) => {
		for (let i = 0; i < count; i++) {
			await userRepo.save(cb ? cb(i) : {
				name: 'u' + i
			});
		}
	};

	it('should save a user', async () => {

		const user = await userRepo.save({
			name: 'Test User'
		});
		should(user.id).type('string');
		should(user.createdAt).instanceOf(Date);
		should(user.updatedAt).instanceOf(Date);

	});

	it('should save multiple users and list them', async () => {

		let count = 10;
		await save(count);
		const users = await userRepo.list();
		should(users).length(count);

	});

	it('should query by name', async () => {

		await save(3);
		const users = await userRepo.list({
			name: 'u2'
		});
		should(users).length(1);
	});

	it('should find a user by id', async () => {

		await userRepo.save({name: 'u1'});
		await userRepo.save({name: 'u2'});
		const u1 = await userRepo.save({name: 'u3'});
		await userRepo.save({name: 'u4'});

		const user = await userRepo.findById(u1.id);


		should(user.id).eql(u1.id);
		should(user.name).eql('u3');

	});

	it('should query by date', async () => {

		const start = new Date('2018-03-10');
		await save(10, (index) => {
			start.setDate(start.getDate() + 1);
			return {
				name: 'n' + index,
				last_login: new Date(start)
			}
		});

		let queryDate = new Date('2018-03-14');
		const users = await userRepo.query((qb) => {
			return qb.where('last_login', '>', queryDate);
		});

		should(users).length(6);
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			should(user.last_login > queryDate).true();
		}

	});

	it('should get an user by id and throw an error', async () => {

		// @ts-ignore
		await userRepo.getById('asd').should.be.rejected();

	});

	it('should get an user by id', async () => {

		const u1 = await userRepo.save({
			name: 'test'
		});
		await userRepo.getById(u1.id).should.fulfilledWith(u1);
	});

	it('should query with data from a sub map', async () => {

		const u1 = await userRepo.save({
			address: {
				street: 'Some Street',
				postal: 1234,
				city: 'City'
			}
		});

		const u2 = await userRepo.save({
			address: {
				street: 'Some Street',
				postal: 5678,
				city: 'City'
			}
		});

		const users = await userRepo.query((qb) => {
			return qb.where('address.postal', '==', 1234);
		});

		should(users).length(1);
		should(users[0]).property('id', u1.id);

	});


});
