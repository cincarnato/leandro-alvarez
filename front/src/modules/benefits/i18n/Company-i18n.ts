export default {
  es: {
    company: { entity: 'Comercio', menu: 'Comercios', crud: 'Comercios', field: { name: 'Nombre', description: 'Descripción', logo: 'Logo', cuit: 'CUIT', contactName: 'Contacto', contactEmail: 'Email de contacto', contactPhone: 'Teléfono de contacto', active: 'Activo' } },
    permission: { 'company:view': 'Consultar comercios', 'company:create': 'Crear comercios', 'company:update': 'Editar comercios', 'company:delete': 'Eliminar comercios', 'company:manage': 'Administrar comercios' },
  },
  en: {
    company: { entity: 'Company', menu: 'Companies', crud: 'Companies', field: { name: 'Name', description: 'Description', logo: 'Logo', cuit: 'Tax ID', contactName: 'Contact', contactEmail: 'Contact email', contactPhone: 'Contact phone', active: 'Active' } },
    permission: { 'company:view': 'View companies', 'company:create': 'Create companies', 'company:update': 'Edit companies', 'company:delete': 'Delete companies', 'company:manage': 'Manage companies' },
  },
}
