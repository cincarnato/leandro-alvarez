import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "benefits",
    name: "Benefit",
    schema: {
        title: {type: 'string', required: true},
        description: {type: 'string'},
        company: {type: 'ref', ref: 'Company', refDisplay: 'name', required: true},
        category: {type: 'ref', ref: 'Category', refDisplay: 'name', required: true},
        image: {type: 'file'},
        startDate: {type: 'date', required: true},
        endDate: {type: 'date', required: true},
        conditions: {type: 'longString', required: true},
        active: {type: 'boolean', default: true},
        featured: {type: 'boolean', default: false},
    }
}

export default schema;
export {schema};
