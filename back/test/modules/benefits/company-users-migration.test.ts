import {after, before, beforeEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {mongoose} from '@drax/common-back';
import {UserModel} from '@drax/identity-back';
import CompanyModel from '../../../src/modules/benefits/models/CompanyModel.js';
import CompanyMembershipMigrationRepository from '../../../src/modules/benefits/repository/mongo/CompanyMembershipMigrationRepository.js';
import MongoInMemory from '../../setup/MongoInMemory.js';

const id = () => new mongoose.Types.ObjectId();

// Collection writes here are test fixtures only; production migration I/O lives in the repository.
describe('Company.users explicit legacy migration (MongoInMemory)', {concurrency: false}, () => {
    const mongo = new MongoInMemory();
    const repository = new CompanyMembershipMigrationRepository();

    before(async () => {
        await mongo.connect();
    });
    after(async () => {
        await mongo.dropAndClose();
    });
    beforeEach(async () => {
        await UserModel.collection.deleteMany({});
        await CompanyModel.collection.deleteMany({});
    });

    it('uses the actual Drax users collection, preserves memberships and legacy data, and is idempotent', async () => {
        assert.equal(UserModel.collection.name, 'users');
        assert.equal(CompanyModel.collection.name, 'Company');
        const company = id(), otherCompany = id(), existingUser = id(), firstUser = id(), secondUser = id();
        await CompanyModel.collection.insertMany([
            {_id: company, name: 'Legacy company', users: [existingUser]},
            {_id: otherCompany, name: 'Existing membership', users: [firstUser]},
        ]);
        await UserModel.collection.insertMany([
            {_id: firstUser, username: 'first', email: 'first@example.com', company, name: 'First', password: 'untouched'},
            {_id: secondUser, username: 'second', email: 'second@example.com', company: company.toHexString(), active: false},
        ]);
        const originalUsers = await UserModel.collection.find({}).toArray();
        const firstRun = await repository.migrate();
        assert.deepEqual(firstRun, {
            candidateUsers: 2, membershipsAdded: 2, membershipsAlreadyPresent: 0,
            missingCompanies: 0, invalidCompanyReferences: 0,
        });
        const migrated = await CompanyModel.collection.findOne({_id: company});
        assert.deepEqual(migrated!.users.map(String).sort(), [existingUser, firstUser, secondUser].map(String).sort());
        const untouched = await CompanyModel.collection.findOne({_id: otherCompany});
        assert.deepEqual(untouched!.users.map(String), [String(firstUser)]);
        assert.deepEqual(await UserModel.collection.find({}).toArray(), originalUsers);

        assert.deepEqual(await repository.migrate(), {
            ...firstRun, membershipsAdded: 0, membershipsAlreadyPresent: 2,
        });
        assert.deepEqual(await CompanyModel.collection.findOne({_id: company}), migrated);
        assert.deepEqual(await UserModel.collection.find({}).toArray(), originalUsers);
    });

    it('creates missing users arrays and safely counts dangling/invalid references without creating companies', async () => {
        const company = id(), user = id(), missingCompany = id();
        await CompanyModel.collection.insertOne({_id: company, name: 'No users array yet'});
        await UserModel.collection.insertMany([
            {_id: user, username: 'valid', email: 'valid@example.com', company},
            {_id: id(), username: 'missing', email: 'missing@example.com', company: missingCompany},
            {_id: id(), username: 'invalid', email: 'invalid@example.com', company: 'not-an-object-id'},
            {_id: id(), username: 'object', email: 'object@example.com', company: {_id: company}},
            {_id: id(), username: 'null', email: 'null@example.com', company: null},
            {_id: id(), username: 'unassigned', email: 'unassigned@example.com'},
        ]);
        assert.deepEqual(await repository.migrate(), {
            candidateUsers: 4, membershipsAdded: 1, membershipsAlreadyPresent: 0,
            missingCompanies: 1, invalidCompanyReferences: 2,
        });
        assert.equal(await CompanyModel.collection.countDocuments({}), 1);
        assert.equal(await CompanyModel.collection.findOne({_id: missingCompany}), null);
        assert.deepEqual((await CompanyModel.collection.findOne({_id: company}))!.users.map(String), [String(user)]);
        assert.equal(await UserModel.collection.countDocuments({company: missingCompany}), 1);
    });

    it('reports an empty migration without changing existing companies', async () => {
        const company = id();
        await CompanyModel.collection.insertOne({_id: company, users: []});
        assert.deepEqual(await repository.migrate(), {
            candidateUsers: 0, membershipsAdded: 0, membershipsAlreadyPresent: 0,
            missingCompanies: 0, invalidCompanyReferences: 0,
        });
        assert.deepEqual((await CompanyModel.collection.findOne({_id: company}))!.users, []);
    });
});
