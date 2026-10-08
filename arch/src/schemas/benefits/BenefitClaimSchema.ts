import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "benefits",
    name: "BenefitClaim",
    schema: {
        benefit: {type: 'ref', ref: 'Benefit', refDisplay: 'title', required: true},
        token: {type: 'string', required: true, unique: true},
        redeemedAt: {type: 'date'},
        redeemedBy: {type: 'ref', ref: 'User', refDisplay: 'username'},
    }
}

export default schema;
export {schema};
