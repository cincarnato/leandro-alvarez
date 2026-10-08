import {IEntitySchema} from "@drax/arch";

const schema: IEntitySchema = {
    module: "benefits",
    name: "Category",
    schema: {
        name: {type: 'string', required: true},
        description: {type: 'string'},
    }
}

export default schema;
export {schema};
