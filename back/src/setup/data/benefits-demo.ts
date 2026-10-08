type DemoCategory = {
    key: string;
    name: string;
    description: string;
};

type DemoCompany = {
    key: string;
    name: string;
    description: string;
    logo: `${string}.png`;
};

export const demoCategories = [
    {key: 'hogar', name: 'Demo · Hogar', description: 'Categoría demo de artículos y soluciones para el hogar.'},
    {key: 'mudanzas', name: 'Demo · Mudanzas', description: 'Categoría demo de traslados y embalaje.'},
    {key: 'construccion', name: 'Demo · Construcción', description: 'Categoría demo de materiales para obras y reformas.'},
    {key: 'decoracion', name: 'Demo · Decoración', description: 'Categoría demo de objetos y propuestas decorativas.'},
    {key: 'jardineria', name: 'Demo · Jardinería', description: 'Categoría demo de plantas y cuidado de espacios verdes.'},
    {key: 'servicios', name: 'Demo · Servicios', description: 'Categoría demo de mantenimiento y tareas domésticas.'},
    {key: 'tecnologia', name: 'Demo · Tecnología', description: 'Categoría demo de accesorios y soluciones tecnológicas.'},
    {key: 'bienestar', name: 'Demo · Bienestar', description: 'Categoría demo de actividades de descanso y bienestar.'},
] as const satisfies readonly DemoCategory[];

export const demoCompanies = [
    {key: 'casa-nativa', name: 'Demo · Casa Nativa', description: 'Comercio ficticio demo de textiles y accesorios para el hogar.', logo: 'casa-nativa.png'},
    {key: 'rumbo-mudanzas', name: 'Demo · Rumbo Mudanzas', description: 'Comercio ficticio demo de mudanzas y embalaje residencial.', logo: 'rumbo-mudanzas.png'},
    {key: 'base-materiales', name: 'Demo · Base Materiales', description: 'Comercio ficticio demo de materiales para pequeñas reformas.', logo: 'base-materiales.png'},
    {key: 'trazo-deco', name: 'Demo · Trazo Deco', description: 'Comercio ficticio demo de iluminación y objetos decorativos.', logo: 'trazo-deco.png'},
    {key: 'verde-patio', name: 'Demo · Verde Patio', description: 'Comercio ficticio demo de plantas, macetas y jardinería.', logo: 'verde-patio.png'},
    {key: 'manos-a-casa', name: 'Demo · Manos a Casa', description: 'Comercio ficticio demo de mantenimiento doméstico.', logo: 'manos-a-casa.png'},
    {key: 'nodo-tecnologia', name: 'Demo · Nodo Tecnología', description: 'Comercio ficticio demo de accesorios y conectividad doméstica.', logo: 'nodo-tecnologia.png'},
    {key: 'pausa-bienestar', name: 'Demo · Pausa Bienestar', description: 'Comercio ficticio demo de clases de relajación y movilidad.', logo: 'pausa-bienestar.png'},
    {key: 'luz-de-casa', name: 'Demo · Luz de Casa', description: 'Comercio ficticio demo de luminarias para interiores.', logo: 'luz-de-casa.png'},
    {key: 'taller-roble', name: 'Demo · Taller Roble', description: 'Comercio ficticio demo de muebles y accesorios de madera.', logo: 'taller-roble.png'},
] as const satisfies readonly DemoCompany[];

type DemoBenefit = {
    title: string;
    description: string;
    company: typeof demoCompanies[number]['key'];
    category: typeof demoCategories[number]['key'];
    conditions: string;
    featured: boolean;
};

export const demoBenefits = [
    {
        title: 'Demo · 15% en textiles para el hogar',
        description: 'Promoción demo simulada de Casa Nativa para renovar almohadones y mantas.',
        company: 'casa-nativa', category: 'hogar',
        conditions: 'Oferta demo simulada, sin validez comercial. 15% sobre precio de lista de almohadones y mantas; compra mínima de 2 unidades. Excluye liquidaciones y productos a medida. Un uso por persona. No acumulable con otras promociones.',
        featured: true,
    },
    {
        title: 'Demo · 10% en mudanzas residenciales',
        description: 'Promoción demo simulada de Rumbo Mudanzas para traslados locales programados.',
        company: 'rumbo-mudanzas', category: 'mudanzas',
        conditions: 'Oferta demo simulada, sin validez comercial. 10% sobre mano de obra y vehículo en traslados de hasta 20 km, de lunes a viernes y con reserva de 7 días. Excluye embalaje, peajes y trabajos con elevador. Un traslado por persona. No acumulable con otras promociones.',
        featured: true,
    },
    {
        title: 'Demo · 12% en adhesivos y pastinas',
        description: 'Promoción demo simulada de Base Materiales para terminaciones de obra.',
        company: 'base-materiales', category: 'construccion',
        conditions: 'Oferta demo simulada, sin validez comercial. 12% sobre precio de lista de adhesivos y pastinas en compras de al menos 3 bolsas, hasta 10 bolsas. Retiro en local; excluye envío y ventas mayoristas. Una compra por persona. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 20% en lámparas de mesa',
        description: 'Promoción demo simulada de Trazo Deco para iluminar rincones de lectura.',
        company: 'trazo-deco', category: 'decoracion',
        conditions: 'Oferta demo simulada, sin validez comercial. 20% sobre precio de lista de una lámpara de mesa de la línea estándar. Excluye bombillas, piezas a pedido y liquidaciones. Un uso por persona, sujeto a stock. No acumulable con otras promociones.',
        featured: true,
    },
    {
        title: 'Demo · 15% en plantas de interior',
        description: 'Promoción demo simulada de Verde Patio para sumar verde al hogar.',
        company: 'verde-patio', category: 'jardineria',
        conditions: 'Oferta demo simulada, sin validez comercial. 15% sobre precio de lista de hasta 3 plantas de interior por compra. Excluye macetas, ejemplares de gran porte y envío. Una compra por persona, sujeto a stock. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 10% en mantenimiento doméstico',
        description: 'Promoción demo simulada de Manos a Casa para ajustes y reparaciones menores.',
        company: 'manos-a-casa', category: 'servicios',
        conditions: 'Oferta demo simulada, sin validez comercial. 10% sobre las primeras 2 horas de mano de obra, con turno de lunes a viernes. Excluye materiales, urgencias y trabajos de gas o electricidad. Una visita por persona. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 18% en accesorios de conectividad',
        description: 'Promoción demo simulada de Nodo Tecnología para el espacio de trabajo doméstico.',
        company: 'nodo-tecnologia', category: 'tecnologia',
        conditions: 'Oferta demo simulada, sin validez comercial. 18% sobre precio de lista de cables de red y adaptadores USB, hasta 2 unidades por persona. Excluye computadoras, routers, instalación y envío. Sujeto a stock. No acumulable con otras promociones.',
        featured: true,
    },
    {
        title: 'Demo · 25% en una clase de relajación',
        description: 'Promoción demo simulada de Pausa Bienestar para una actividad grupal de descanso.',
        company: 'pausa-bienestar', category: 'bienestar',
        conditions: 'Oferta demo simulada, sin validez comercial. 25% sobre una clase grupal de relajación de 60 minutos para participantes nuevos, con reserva de 48 horas. Excluye sesiones individuales y abonos. Un uso por persona, sujeto a cupo. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 15% en apliques de pared',
        description: 'Promoción demo simulada de Luz de Casa para iluminación de interiores.',
        company: 'luz-de-casa', category: 'hogar',
        conditions: 'Oferta demo simulada, sin validez comercial. 15% sobre precio de lista de hasta 2 apliques de pared de catálogo. Excluye instalación, bombillas y modelos personalizados. Una compra por persona, sujeto a stock. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 12% en estantes de madera',
        description: 'Promoción demo simulada de Taller Roble para organizar y decorar ambientes.',
        company: 'taller-roble', category: 'decoracion',
        conditions: 'Oferta demo simulada, sin validez comercial. 12% sobre precio de lista de hasta 2 estantes de medidas estándar. Excluye muebles a medida, colocación y envío. Una compra por persona, sujeto a stock. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 10% en kits de embalaje',
        description: 'Promoción demo simulada de Rumbo Mudanzas para preparar un traslado.',
        company: 'rumbo-mudanzas', category: 'mudanzas',
        conditions: 'Oferta demo simulada, sin validez comercial. 10% sobre precio de lista de un kit de 10 cajas y 2 rollos de cinta, con retiro en local. Excluye armado de cajas, embalaje profesional y envío. Un kit por persona. No acumulable con otras promociones.',
        featured: false,
    },
    {
        title: 'Demo · 20% en macetas de terracota',
        description: 'Promoción demo simulada de Verde Patio para acompañar plantas y renovar el patio.',
        company: 'verde-patio', category: 'jardineria',
        conditions: 'Oferta demo simulada, sin validez comercial. 20% sobre precio de lista de macetas de terracota de hasta 25 cm, mínimo 2 y máximo 4 unidades. Excluye plantas, platos y envío. Una compra por persona, sujeto a stock. No acumulable con otras promociones.',
        featured: false,
    },
] as const satisfies readonly DemoBenefit[];
