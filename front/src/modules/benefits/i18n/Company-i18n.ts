export default {
  es: {
    company: { entity: 'Comercio', menu: 'Comercios', crud: 'Comercios', field: { name: 'Nombre', description: 'Descripción', logo: 'Logo', cuit: 'CUIT', contactName: 'Contacto', contactEmail: 'Email de contacto', contactPhone: 'Teléfono de contacto', users: 'Usuarios', active: 'Activo' } },
    companyUsers: { loadError: 'No se pudieron cargar los usuarios. Intente nuevamente.', create: 'Crear Usuario', createError: 'No se pudo crear el usuario. Intente nuevamente.' },
    permission: { 'company:view': 'Consultar comercios', 'company:create': 'Crear comercios', 'company:update': 'Editar comercios', 'company:delete': 'Eliminar comercios', 'company:manage': 'Administrar comercios' },
  },
  en: {
    company: { entity: 'Company', menu: 'Companies', crud: 'Companies', field: { name: 'Name', description: 'Description', logo: 'Logo', cuit: 'Tax ID', contactName: 'Contact', contactEmail: 'Contact email', contactPhone: 'Contact phone', users: 'Users', active: 'Active' } },
    companyUsers: { loadError: 'Unable to load users. Please try again.', create: 'Create User', createError: 'Unable to create the user. Please try again.' },
    permission: { 'company:view': 'View companies', 'company:create': 'Create companies', 'company:update': 'Edit companies', 'company:delete': 'Delete companies', 'company:manage': 'Manage companies' },
  },
}
