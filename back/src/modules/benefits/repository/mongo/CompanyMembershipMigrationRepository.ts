import {mongoose} from '@drax/common-back';
import {UserModel} from '@drax/identity-back';
import CompanyModel from '../../models/CompanyModel.js';

export interface CompanyMembershipMigrationSummary {
    candidateUsers: number;
    membershipsAdded: number;
    membershipsAlreadyPresent: number;
    missingCompanies: number;
    invalidCompanyReferences: number;
}

function companyId(value: unknown): mongoose.Types.ObjectId | null {
    if (value instanceof mongoose.Types.ObjectId) return value;
    if (typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)) {
        return new mongoose.Types.ObjectId(value);
    }
    return null;
}

export default class CompanyMembershipMigrationRepository {
    async migrate(): Promise<CompanyMembershipMigrationSummary> {
        const summary: CompanyMembershipMigrationSummary = {
            candidateUsers: 0,
            membershipsAdded: 0,
            membershipsAlreadyPresent: 0,
            missingCompanies: 0,
            invalidCompanyReferences: 0,
        };
        // Raw collections retain access to legacy fields even after their schemas stop declaring them.
        // Drax UserModel uses "users" (not "User"); never infer collection names from model names.
        const users = UserModel.collection.find(
            {company: {$exists: true, $ne: null}},
            {projection: {_id: 1, company: 1}},
        );
        try {
            for await (const user of users) {
                summary.candidateUsers++;
                const company = companyId(user.company);
                if (!company) {
                    summary.invalidCompanyReferences++;
                    continue;
                }
                const result = await CompanyModel.collection.updateOne(
                    {_id: company},
                    {$addToSet: {users: user._id}},
                    {upsert: false},
                );
                if (!result.matchedCount) summary.missingCompanies++;
                else if (result.modifiedCount) summary.membershipsAdded++;
                else summary.membershipsAlreadyPresent++;
            }
        } finally {
            await users.close();
        }
        return summary;
    }
}
