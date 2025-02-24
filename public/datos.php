<?php
	header('Content-Type: application/json');
    $HOME_ID = "municipios";
	$DEF = [
			"sociedad" => [
		        "vecino" => [
					"form" => "nAwLTKSm",
					"desc" => "Queremos conocer más sobre tu historia. Contanos experiencias de tu recorrido y anécdotas que recuerdes."
				],
		        "institucion-solidaria" => [
					"form" => "LXlD4JEq",
					"desc" => "Queremos conocer más sobre la institución y a quiénes acompañan. ¡Ayúdennos a contar esta historia!"
				],
		        "emprendedores" => [
					"form" => "U5TLde",
					"desc" => "Queremos conocer más sobre los emprendedores de la ciudad y los servicios y productos que ofrecen. ¡Cuéntennos un poco más acerca de la historia de su proyecto!"
				],
		        "comercios" => [
					"form" => "vTxfgY",
					"desc" => "Queremos conocer más sobre los comercios de la ciudad y las alternativas que ofrecen. Cuéntennos un poco más acerca de la historia de su negocio y cuáles son sus recomendaciones."
				],
		        "profesionales" => [
					"form" => "KPUFsQ",
					"desc" => "Queremos conocer más sobre tu historia y por qué decidiste ser profesional. Contanos más acerca de tu recorrido y las anécdotas que recordás"
				],
		        "mitos" => [
					"form" => "zscooC",
					"desc" => "Queremos conocer más sobre este mito popular de la ciudad y cómo fue que se originó. ¡Ayudanos a contar esta historia!"
				],
		        "fechas" => [
					"form" => "EOkPMd",
					"desc" => "Queremos conocer un poco más sobre la celebración de este día y de las personas que lo hacen posible. Cuéntenos cuáles son sus propósitos con cada nueva edición."
				],
		        "inauguraciones" => [
					"form" => "BbV5d0",
					"desc" => "Queremos conocer cuáles son las actividades y los productos que ofrecen. Cuéntenos cómo arrancaron esta aventura y por qué creen que los vecinos tienen que visitarlos."
				],
		        "ilustres" => [
					"form" => "Eg9HGE",
					"desc" => "Queremos conocer más sobre tu trayectoria y por qué se te considera una personalidad destacada en la ciudad. Ayudanos a contar esta historia."
				],
		        "personajes" => [
					"form" => "FlSBvj",
					"desc" => "Queremos conocer más sobre la vida de esta personalidad destacada para la ciudad. ¡Ayudanos a contar esta historia!"
				],
		        "familias" => [
					"form" => "XxjzW5",
					"desc" => "Queremos conocer más sobre su historia y por qué se los considera una familia tradicional en la ciudad. Cuéntennos un poco más sobre sus recuerdos y costumbres."
				],
		        "reinas" => [
					"form" => "XQPp6S",
					"desc" => "Queremos conocer más sobre tu historia y por qué decidiste postularte como reina. Contanos qué te motivó a presentarte y cómo fue que te convertiste en la elegida."
				]
		],
	    "entretenimiento" => [
		        "artista-visual" => [
					"form" => "lSe4yGkW",
					"desc" => "Queremos conocer más acerca de tu labor como artista, cómo arrancaste este proyecto y cuáles son tus planes para el futuro. Ayudanos a contar esta historia."
				],
		        "produccion-audiovisual" => [
					"form" => "kFAXfzfG",
					"desc" => "Queremos conocer más acerca de las producciones que realizan, cómo arrancaron este proyecto y cuáles son sus planes para el futuro. Ayúdennos a contar su historia."
				],
		        "centros" => [
					"form" => "KBLyIK",
					"desc" => "Queremos conocer las actividades, las muestras, los talleres y los espectáculos que ofrecen. Cuéntenos un poco más sobre la historia de su espacio y el rol de los centros culturales en la ciudad."
				],
		        "bandas" => [
					"form" => "ibio2n",
					"desc" => "Queremos conocer más sobre la historia de la banda y las fechas en las que se estarán presentando. ¡Cuéntennos!"
				],
		        "conciertos" => [
					"form" => "vCabAy",
					"desc" => "Queremos conocer la historia de este espacio y los cronogramas que ofrece. ¡Cuéntennos un poco más!"
				],
		        "festival" => [
					"form" => "veYdCv",
					"desc" => "Queremos conocer un poco más sobre la historia del grupo y de las actividades que llevan a cabo. ¿Cuáles son sus propósitos para el futuro?"
				],
		        "museo" => [
					"form" => "rl91tK",
					"desc" => "Queremos conocer cuáles son las actividades y muestras que ofrecen, y saber un poco más sobre la historia del museo. ¿Cuáles son sus artistas recomendados?"
				],
		        "teatro" => [
					"form" => "ZJSl8m",
					"desc" => "Queremos conocer cuáles son las obras y actividades que ofrece su teatro. Ayúdennos a contar esta historia"
				]
	    ],
	    "animales" => [
		        "refugio-en-campaña" => [
					"form" => "bnuPmLOF",
					"desc" => "Queremos conocer más sobre la campaña que está organizando el refugio. Cuentennos de qué se trata"
				],
		        "mascota-en-adopcion" => [
					"form" => "CEUQzWvV",
					"desc" => "¡Este animalito busca un hogar! Completá este formulario para que podamos hacer que encuentre a su próxima familia"
				],
		        "historias-de-adopcion" => [
					"form" => "fo0xhFOO",
					"desc" => "¡Un éxito! Este animalito encontró finalmente una familia. Ayudanos a contar esta historia"
				],
		        "historias-de-reencuentro" => [
					"form" => "wouHoBFl",
					"desc" => "¡Final feliz! Dueño y mascota finalmente se reencontraron. Ayudanos a contar esta historia"
				],
		        "mascota-perdida" => [
					"form" => "C8rLrCtg",
					"desc" => "¡Se perdió una mascota! Ayudanos a encontrarla completando este formulario"
				],
		        "mascota-encontrada" => [
					"form" => "ZJiSnh1q",
					"desc" => "¡Encontramos una mascota perdida! Ayudanos a reencontrarlo con su dueño completando este formulario"
				],
		        "historias-de-refugios" => [
					"form" => "XMpqfLJ7",
					"desc" => "Queremos conocer más sobre la historia del refugio y su labor. Contanos más acerca de su recorrido y las anécdotas que recordás."
				]
	    ],
	    "salud" => [
		        "profesional-vet" => [
					"form" => "lGkJ3Z",
					"desc" => "Queremos conocer más sobre tu historia y por qué decidiste ser veterinario. Contanos más acerca de tu recorrido, anécdotas y recomendaciones"
				],
		        "veterinarias" => [
					"form" => "i3ltN1",
					"desc" => "Queremos conocer más sobre los servicios a los que se dedican y las alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
				],
		        "peluquerias" => [
					"form" => "Wj6Pgj",
					"desc" => "Queremos conocer más sobre los servicios a los que se dedican y las diferentes alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
				],
		        "spa" => [
					"form" => "mlmdVA",
					"desc" => "Queremos conocer más sobre los servicios a los que se dedican y las alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
				],
		        "profesionales" => [
					"form" => "DDz2Py",
					"desc" => "Queremos conocer más sobre tu historia y por qué decidiste dedicarte a la medicina. Contanos más acerca de tu recorrido y anécdotas."
				],
		        "instituciones" => [
					"form" => "EvJilr",
					"desc" => "Queremos conocer más sobre la historia de la Institución y sobre por qué decidieron dedicarse a la salud. También todo sobre su recorrido y anécdotas que recuerden."
				]
	    ],
	    "construccion" => [
		        "proyecto" => [
					"form" => "F4xQaZ",
					"desc" => "Queremos conocer un poco más sobre la historia del proyecto y sobre el impacto que tendrá en la ciudad. Cuéntenos cómo arrancó esta aventura y cómo cambiará la vida de los ciudadanos."
				],
		        "comercios" => [
					"form" => "JAvwt9",
					"desc" => "¡Queremos conocer más sobre tu comercio! Cuéntennos un poco más sobre la historia del espacio y cuáles son las opciones que ofrecen"
				],
		        "corralones" => [
					"form" => "sSBRKD",
					"desc" => "Queremos conocer más sobre los corralones de la ciudad y sobre el rubro de la construcción. Cuéntennos la historia de su negocio y cuáles son las opciones que ofrecen."
				],
		        "profesionales" => [
					"form" => "uk89Ct",
					"desc" => "Queremos conocer más sobre tu historia y por qué decidiste convertirte en profesional. Contanos acerca de tu recorrido y las anécdotas que recordás."
				]
	    ],
	    "medioambiente" => [
		        "instituciones" => [
					"form" => "vA8EAk",
					"desc" => "Queremos saber más sobre su institución y cómo contribuye al cuidado del medioambiente. Contanos sobre la historia del espacio y las actividades que realizan"
				],
		        "proyectos" => [
					"form" => "Nk9fY2",
					"desc" => "Queremos saber más sobre tu proyecto y cómo ayuda al medioambiente. Contanos cómo fue el recorrido para realizarlo y qué actividades proponen."
				]
	    ],
	    "autos" => [
		        "historias" => [
					"form" => "AYvcCm",
					"desc" => "Queremos conocer más sobre tu auto y su historia. Contanos un poco más acerca de este vehículo."

				],
		        "concesionarios" => [
					"form" => "Cb5WuZ",
					"desc" => "Queremos conocer más sobre su negocio y las alternativas de marcas que ofrecen. También sobre la historia de su espacio y sus propuestas."
				]
	    ],
	    "turismo" => [
		        "maravillas" => [
					"form" => "Tj1qJ0",
					"desc" => "Queremos saber un poco más sobre los atractivos que tiene la región y los paseos que pueden realizarse. Hablemos de las particularidades del lugar y por qué hay que visitarlo."
				],
		        "servicios" => [
					"form" => "oXE2ch",
					"desc" => "Queremos conocer cuáles son los servicios que ofrecen. ¡Cuéntenos cómo comenzaron este emprendimiento y sus mayores atracciones!"
				],
		        "hotel" => [
					"form" => "pFk7zy",
					"desc" => "Queremos saber más sobre la historia del hotel y sus instalaciones. ¡Contanos más sobre el desarrollo del emprendimiento y sus historias!"
				],
		        "paseos" => [
					"form" => "CQ63S6",
					"desc" => "Queremos conocer cuáles son las actividades y los paseos que ofrecen. También nos interesan recomendaciones de distintos recorridos. Ayudennos a escribir esta historia."
				]
	    ],
	    "gastronomía" => [
		        "cervecerias" => [
					"form" => "iWex5S",
					"desc" => "Queremos conocer cuáles son las cervezas que producen y las alternativas que ofrecen en su espacio. Ayudennos a contar esta historia."
				],
		        "bodegas" => [
					"form" => "MvnR1P",
					"desc" => "Queremos conocer el proceso de producción de la bodega y las alternativas que ofrecen. También nos interesa saber la historia del lugar, ¡cuéntennos todo!"
				],
		        "productores" => [
					"form" => "IzTHyQ",
					"desc" => "Queremos conocer un poco más sobre los productores de la región y sobre su recorrido en el rubro. ¡Ayudanos a contar esta historia!"
				],
		        "platos" => [
					"form" => "uLvkHO",
					"desc" => "Queremos conocer más sobre la historia de este plato en la familia y por qué se lo considera tradicional en la ciudad. Ayudennos a contar esta historia."
				],
		        "bares" => [
					"form" => "LXnMNp",
					"desc" => "Queremos conocer cuáles son los tragos y las alternativas que ofrecen en su espacio. También nos interesa conocer la historia del lugar: ¡cuéntennos todo!"
				],
		        "restaurantes" => [
					"form" => "WwRj85",
					"desc" => "Queremos conocer cuáles son los platos y alternativas que ofrecen en su espacio. También nos interesa conocer la historia del lugar: ¡cuéntennos todo!"
				]
	    ],
	    "moda" => [
		        "eventos" => [
					"form" => "mBS6jH",
					"desc" => "Queremos conocer un poco más sobre el evento y de las personas que lo hacen posible. Cuéntenos cómo arrancaron esta aventura y cuáles son sus propósitos con cada nueva edición."
				],
		        "locales" => [
					"form" => "LGmiwG",
					"desc" => "Queremos conocer más sobre los servicios a los que se dedican y las diferentes alternativas que ofrecen. Cuéntennos acerca de su espacio y cuáles son sus colecciones."
				],
		        "Diseñadores" => [
					"form" => "Jn81sV",
					"desc" => "Queremos conocer más sobre la profesión a la que se dedican y las alternativas que ofrecen. Cuéntennos un poco más acerca de su historia en el ámbito de la moda y cuáles son sus recomendaciones."
				]
	    ],
	    "deportes" => [
		        "instituciones" => [
					"form" => "OiipzV",
					"desc" => "Queremos saber más sobre la historia y la actualidad del club. Cuéntennos más acerca de este emblema de la ciudad y las anécdotas que giran alrededor de él."
				],
		        "personajes" => [
					"form" => "INSVCp",
					"desc" => "Queremos saber más sobre tu historia y tu recorrido en el deporte. Contanos cuánto te costó llegar a donde llegaste y qué experiencias memorables recordás."
				]
	    ],
	    "educación" => [
		        "alumnos" => [
					"form" => "VzmGua",
					"desc" => "Queremos conocer más sobre tu trayectoria y sobre tus recuerdos más divertidos de la época escolar. Ayudanos a contar esta historia"
				],
		        "instituciones" => [
					"form" => "eNWwRW",
					"desc" => "Queremos conocer más sobre la historia de la Institución y sobre por qué decidieron dedicarse a la educación. Ayúdennos a contar esta historia"
				],
		        "Educadores" => [
					"form" => "bA5mMl",
					"desc" => "Queremos conocer más sobre tu trayectoria y por qué decidiste dedicarte a la educación. Ayudanos a contar esta historia"
				]
	    ]
	];
	echo json_encode($DEF);
?> 
