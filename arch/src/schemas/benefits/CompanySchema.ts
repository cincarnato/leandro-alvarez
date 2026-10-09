import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "benefits",
    name: "Company",
    schema: {
        name: {type: 'string', required: true},
        description: {type: 'string'},
        logo: {type: 'file'},
        cuit: {type: 'string'},
        contactName: {type: 'string'},
        contactEmail: {type: 'string'},
        contactPhone: {type: 'string'},
        active: {type: 'boolean', default: true},
                users: {type: 'array.ref', ref: 'User', refDisplay: 'name'},
    }
}

export default schema;
export {schema};
