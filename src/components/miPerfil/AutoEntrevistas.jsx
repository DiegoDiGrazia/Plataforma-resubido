import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Sidebar from '../sidebar/Sidebar';
import "./miPerfil.css";
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';



const DEF = {
    "sociedad": {
        "vecino": {
            "form": "nAwLTKSm",
            "desc": "Queremos conocer más sobre tu historia. Contanos experiencias de tu recorrido y anécdotas que recuerdes."
        },
        "institucion-solidaria": {
            "form": "LXlD4JEq",
            "desc": "Queremos conocer más sobre la institución y a quiénes acompañan. ¡Ayúdennos a contar esta historia!"
        },
        "emprendedores": {
            "form": "U5TLde",
            "desc": "Queremos conocer más sobre los emprendedores de la ciudad y los servicios y productos que ofrecen. ¡Cuéntennos un poco más acerca de la historia de su proyecto!"
        },
        "comercios": {
            "form": "vTxfgY",
            "desc": "Queremos conocer más sobre los comercios de la ciudad y las alternativas que ofrecen. Cuéntennos un poco más acerca de la historia de su negocio y cuáles son sus recomendaciones."
        },
        "profesionales": {
            "form": "KPUFsQ",
            "desc": "Queremos conocer más sobre tu historia y por qué decidiste ser profesional. Contanos más acerca de tu recorrido y las anécdotas que recordás"
        },
        "mitos": {
            "form": "zscooC",
            "desc": "Queremos conocer más sobre este mito popular de la ciudad y cómo fue que se originó. ¡Ayudanos a contar esta historia!"
        },
        "fechas": {
            "form": "EOkPMd",
            "desc": "Queremos conocer un poco más sobre la celebración de este día y de las personas que lo hacen posible. Cuéntenos cuáles son sus propósitos con cada nueva edición."
        },
        "inauguraciones": {
            "form": "BbV5d0",
            "desc": "Queremos conocer cuáles son las actividades y los productos que ofrecen. Cuéntenos cómo arrancaron esta aventura y por qué creen que los vecinos tienen que visitarlos."
        },
        "ilustres": {
            "form": "Eg9HGE",
            "desc": "Queremos conocer más sobre tu trayectoria y por qué se te considera una personalidad destacada en la ciudad. Ayudanos a contar esta historia."
        },
        "personajes": {
            "form": "FlSBvj",
            "desc": "Queremos conocer más sobre la vida de esta personalidad destacada para la ciudad. ¡Ayudanos a contar esta historia!"
        },
        "familias": {
            "form": "XxjzW5",
            "desc": "Queremos conocer más sobre su historia y por qué se los considera una familia tradicional en la ciudad. Cuéntennos un poco más sobre sus recuerdos y costumbres."
        },
        "reinas": {
            "form": "XQPp6S",
            "desc": "Queremos conocer más sobre tu historia y por qué decidiste postularte como reina. Contanos qué te motivó a presentarte y cómo fue que te convertiste en la elegida."
        }
    },
    "entretenimiento": {
        "artista-visual": {
            "form": "lSe4yGkW",
            "desc": "Queremos conocer más acerca de tu labor como artista, cómo arrancaste este proyecto y cuáles son tus planes para el futuro. Ayudanos a contar esta historia."
        },
        "produccion-audiovisual": {
            "form": "kFAXfzfG",
            "desc": "Queremos conocer más acerca de las producciones que realizan, cómo arrancaron este proyecto y cuáles son sus planes para el futuro. Ayúdennos a contar su historia."
        },
        "centros": {
            "form": "KBLyIK",
            "desc": "Queremos conocer las actividades, las muestras, los talleres y los espectáculos que ofrecen. Cuéntenos un poco más sobre la historia de su espacio y el rol de los centros culturales en la ciudad."
        },
        "bandas": {
            "form": "ibio2n",
            "desc": "Queremos conocer más sobre la historia de la banda y las fechas en las que se estarán presentando. ¡Cuéntennos!"
        },
        "conciertos": {
            "form": "vCabAy",
            "desc": "Queremos conocer la historia de este espacio y los cronogramas que ofrece. ¡Cuéntennos un poco más!"
        },
        "festival": {
            "form": "veYdCv",
            "desc": "Queremos conocer un poco más sobre la historia del grupo y de las actividades que llevan a cabo. ¿Cuáles son sus propósitos para el futuro?"
        },
        "museo": {
            "form": "rl91tK",
            "desc": "Queremos conocer cuáles son las actividades y muestras que ofrecen, y saber un poco más sobre la historia del museo. ¿Cuáles son sus artistas recomendados?"
        },
        "teatro": {
            "form": "ZJSl8m",
            "desc": "Queremos conocer cuáles son las obras y actividades que ofrece su teatro. Ayúdennos a contar esta historia"
        }
    },
    "animales": {
        "refugio-en-campaña": {
            "form": "bnuPmLOF",
            "desc": "Queremos conocer más sobre la campaña que está organizando el refugio. Cuentennos de qué se trata"
        },
        "mascota-en-adopcion": {
            "form": "CEUQzWvV",
            "desc": "¡Este animalito busca un hogar! Completá este formulario para que podamos hacer que encuentre a su próxima familia"
        },
        "historias-de-adopcion": {
            "form": "fo0xhFOO",
            "desc": "¡Un éxito! Este animalito encontró finalmente una familia. Ayudanos a contar esta historia"
        },
        "historias-de-reencuentro": {
            "form": "wouHoBFl",
            "desc": "¡Final feliz! Dueño y mascota finalmente se reencontraron. Ayudanos a contar esta historia"
        },
        "mascota-perdida": {
            "form": "C8rLrCtg",
            "desc": "¡Se perdió una mascota! Ayudanos a encontrarla completando este formulario"
        },
        "mascota-encontrada": {
            "form": "ZJiSnh1q",
            "desc": "¡Encontramos una mascota perdida! Ayudanos a reencontrarlo con su dueño completando este formulario"
        },
        "historias-de-refugios": {
            "form": "XMpqfLJ7",
            "desc": "Queremos conocer más sobre la historia del refugio y su labor. Contanos más acerca de su recorrido y las anécdotas que recordás."
        }
    },
    "salud": {
        "profesional-vet": {
            "form": "lGkJ3Z",
            "desc": "Queremos conocer más sobre tu historia y por qué decidiste ser veterinario. Contanos más acerca de tu recorrido, anécdotas y recomendaciones"
        },
        "veterinarias": {
            "form": "i3ltN1",
            "desc": "Queremos conocer más sobre los servicios a los que se dedican y las alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
        },
        "peluquerias": {
            "form": "Wj6Pgj",
            "desc": "Queremos conocer más sobre los servicios a los que se dedican y las diferentes alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
        },
        "spa": {
            "form": "mlmdVA",
            "desc": "Queremos conocer más sobre los servicios a los que se dedican y las alternativas que ofrecen. También sobre su espacio y sus recomendaciones."
        },
        "profesionales": {
            "form": "DDz2Py",
            "desc": "Queremos conocer más sobre tu historia y por qué decidiste dedicarte a la medicina. Contanos más acerca de tu recorrido y anécdotas."
        },
        "instituciones": {
            "form": "EvJilr",
            "desc": "Queremos conocer más sobre la historia de la Institución y sobre por qué decidieron dedicarse a la salud. También todo sobre su recorrido y anécdotas que recuerden."
        }
    },
    "construccion": {
        "proyecto": {
            "form": "F4xQaZ",
            "desc": "Queremos conocer un poco más sobre la historia del proyecto y sobre el impacto que tendrá en la ciudad. Cuéntenos cómo arrancó esta aventura y cómo cambiará la vida de los ciudadanos."
        },
        "comercios": {
            "form": "JAvwt9",
            "desc": "¡Queremos conocer más sobre tu comercio! Cuéntennos un poco más sobre la historia del espacio y cuáles son las opciones que ofrecen"
        },
        "corralones": {
            "form": "sSBRKD",
            "desc": "Queremos conocer más sobre los corralones de la ciudad y sobre el rubro de la construcción. Cuéntennos la historia de su negocio y cuáles son las opciones que ofrecen."
        },
        "profesionales": {
            "form": "uk89Ct",
            "desc": "Queremos conocer más sobre tu historia y por qué decidiste convertirte en profesional. Contanos acerca de tu recorrido y las anécdotas que recordás."
        }
    },
    "medioambiente": {
        "instituciones": {
            "form": "vA8EAk",
            "desc": "Queremos saber más sobre su institución y cómo contribuye al cuidado del medioambiente. Contanos sobre la historia del espacio y las actividades que realizan"
        },
        "proyectos": {
            "form": "Nk9fY2",
            "desc": "Queremos saber más sobre tu proyecto y cómo ayuda al medioambiente. Contanos cómo fue el recorrido para realizarlo y qué actividades proponen."
        }
    },
    "autos": {
        "historias": {
            "form": "AYvcCm",
            "desc": "Queremos conocer más sobre tu auto y su historia. Contanos un poco más acerca de este vehículo."
        },
        "concesionarios": {
            "form": "Cb5WuZ",
            "desc": "Queremos conocer más sobre su negocio y las alternativas de marcas que ofrecen. También sobre la historia de su espacio y sus propuestas."
        }
    },
    "turismo": {
        "maravillas": {
            "form": "Tj1qJ0",
            "desc": "Queremos saber un poco más sobre los atractivos que tiene la región y los paseos que pueden realizarse. Hablemos de las particularidades del lugar y por qué hay que visitarlo."
        },
        "servicios": {
            "form": "oXE2ch",
            "desc": "Queremos conocer cuáles son los servicios que ofrecen. ¡Cuéntenos cómo comenzaron este emprendimiento y sus mayores atracciones!"
        },
        "hotel": {
            "form": "pFk7zy",
            "desc": "Queremos saber más sobre la historia del hotel y sus instalaciones. ¡Contanos más sobre el desarrollo del emprendimiento y sus historias!"
        },
        "paseos": {
            "form": "CQ63S6",
            "desc": "Queremos conocer cuáles son las actividades y los paseos que ofrecen. También nos interesan recomendaciones de distintos recorridos. Ayudennos a escribir esta historia."
        }
    },
    "moda": {
        "diseñador": {
            "form": "fHnKld",
            "desc": "Queremos conocer más sobre tu historia como diseñador, cómo comenzaste en la industria y qué proyectos tienes para el futuro. Ayúdanos a contar tu historia."
        },
        "tienda": {
            "form": "Zp1qNz",
            "desc": "Queremos conocer más sobre tu tienda, los productos que ofreces y cómo has logrado destacar en el mercado. Cuéntanos sobre tu recorrido y los desafíos que has enfrentado."
        },
        "modelos": {
            "form": "lD2M0n",
            "desc": "Queremos conocer más sobre tu carrera como modelo, los proyectos en los que has participado y cómo llegaste a este mundo. Cuéntanos tu historia."
        }
    },
    "deporte": {
        "atleta": {
            "form": "fH7x9d",
            "desc": "Queremos conocer más sobre tu carrera como atleta, los logros que has alcanzado y los desafíos que has superado. Cuéntanos sobre tu recorrido y tu visión sobre el deporte."
        },
        "entrenador": {
            "form": "vQ8tFd",
            "desc": "Queremos conocer más sobre tu experiencia como entrenador, cómo ayudas a los atletas a alcanzar su máximo potencial y qué filosofía sigues. Ayúdanos a contar tu historia."
        },
        "club-deportivo": {
            "form": "zN9q5e",
            "desc": "Queremos conocer más sobre tu club deportivo, las actividades que realizan y cómo contribuyen al desarrollo de los atletas. Cuéntanos sobre los logros y proyectos del club."
        }
    },
    "gastronomia": {
        "restaurante": {
            "form": "zR8l9P",
            "desc": "Queremos conocer más sobre tu restaurante, el tipo de cocina que ofreces y las experiencias que brindas a tus comensales. Cuéntanos sobre el recorrido de tu restaurante."
        },
        "chef": {
            "form": "vB7YpL",
            "desc": "Queremos conocer más sobre tu carrera como chef, tus influencias culinarias y los platos que más te apasionan. Ayúdanos a contar tu historia."
        },
        "receta": {
            "form": "bL2n6V",
            "desc": "Queremos conocer una de tus recetas más especiales, los ingredientes que utilizas y el proceso de preparación. Cuéntanos cómo haces magia en la cocina."
        }
    },
    "educacion": {
        "escuela": {
            "form": "pJ9t2X",
            "desc": "Queremos conocer más sobre tu escuela, los programas educativos que ofrecen y cómo contribuyen al desarrollo de los estudiantes. Cuéntanos sobre tu historia educativa."
        },
        "profesor": {
            "form": "tQ4R7m",
            "desc": "Queremos conocer más sobre tu carrera como profesor, las materias que enseñas y cómo impactas la vida de tus estudiantes. Cuéntanos sobre tu experiencia."
        },
        "curso": {
            "form": "vJ6y5B",
            "desc": "Queremos conocer más sobre el curso que ofreces, los temas que cubre y cómo ayuda a los estudiantes a mejorar sus habilidades. Cuéntanos sobre el contenido de tu curso."
        }
    }
};



const AutoEntrevistas = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filtrar las categorías por nombre (categoriaKey)
    const filteredCategories = Object.keys(DEF).filter((categoriaKey) =>
        categoriaKey.toLowerCase().includes(searchQuery.toLowerCase())
    );
    


    return (
        <>
                <div className="content flex-grow-1 crearNotaGlobal">
                    <div className='row miPerfilContainer soporteContainer'>
                        <div className='col p-0'>
                            <h3 id="saludo" className='headerTusNotas ml-0'>
                                <img src="/images/auto_entrevistas_icon.png" alt="Icono 1" className="icon me-2 icono_tusNotas" /> Autoentrevistas
                            </h3>
                            <h4 className='infoCuenta'>Entrevistas</h4>
                            <div className='abajoDeTusNotas'>
                                Aquí encontrarás contenidos que te ayudarán a potenciar el uso de nuestra plataforma. <br />
                                Tips, consejos, tutoriales y ayuda para tus contenidos
                            </div>
                        </div>
                    </div>

                    <div className='row miPerfilContainer soporteContainer mt-4 p-0 mb-5'>
                        <div className='col todasLasNotas p-0 pt-2'>
                            Todas las entrevistas
                        </div>
                        <div className='col buscadorNotas'>
                            <form className='buscadorNotasForm'>
                                <input
                                    className='inputBuscadorNotas'
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="      Buscar por entrevista"
                                />
                            </form>
                        </div>
                    </div>

                    <div className='row miPerfilContainer soporteContainer mt-4 p-0'>
                        {filteredCategories.map((categoriaKey, index) => (
                            <div key={index} className='col-4'>
                                <div className="card" style={{
                                    width: "auto",
                                    height: "400px",
                                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.81)), url('/images/${categoriaKey}.png')`,
                                    backgroundPosition: "center",  // Centra la imagen
                                }}>
                                    <div className="card-body">
                                        <h5 className="card-title" style={{ fontSize: "20px", borderBottom: "1px solid #667085", height: "25px", paddingBottom: "5px" }}>{categoriaKey}</h5>

                                        <div id={categoriaKey} className="carousel slide" style={{ height: "350px", padding: "5px 30px" }} data-bs-ride="carousel">
                                            <ol className="carousel-indicators" style={{ backgroundColor: "gray" }}>
                                                {Object.keys(DEF[categoriaKey]).map((item, index) => (
                                                    <li
                                                        key={index}
                                                        data-bs-target={"#" + categoriaKey}
                                                        data-bs-slide-to={index}
                                                        className={index === 0 ? "active" : ""}
                                                    ></li>
                                                ))}
                                            </ol>
                                            <div className="carousel-inner" >
                                                {Object.keys(DEF[categoriaKey]).map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                                                    >
                                                        <h5 className="card-title" style={{ color: "#212529", fontSize: "20px" }}>{item}</h5>
                                                        <p className="abajoDeTusNotas" style={{ color: "#212529", height: "120px", fontWeight: "bold" }}>{DEF[categoriaKey][item].desc}</p>
                                                        <Button
                                                            onClick={() => window.open(`https://entrevista.serviciosd.com/${categoriaKey}/${item}`, '_blank')}
                                                            variant="none"
                                                            className='botonCerrarSesion'
                                                            style={{ backgroundColor: "white", margin: "0px 0px 0px 10px", borderColor: "black" }}
                                                        >
                                                            {"Autoentrevistarse"}
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                const url = `https://entrevista.serviciosd.com/${categoriaKey}/${item}`;
                                                                navigator.clipboard.writeText(url)
                                                                    .then(() => {
                                                                        alert('URL copiada al portapapeles');
                                                                    })
                                                                    .catch((error) => {
                                                                        console.error('Error al copiar la URL: ', error);
                                                                    });
                                                            }}
                                                            variant="none"
                                                            className='botonCerrarSesion'
                                                            style={{ backgroundColor: "white", margin: "10px", borderColor: "black" }}
                                                        >
                                                            {"Copiar URL"}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                className="carousel-control-prev"
                                                type="button"
                                                data-bs-target={"#" + categoriaKey}
                                                data-bs-slide="prev"
                                                style={{ width: "15px" }}
                                            >
                                                <i className="bi bi-caret-left-fill" style={{ color: "black" }}></i>
                                                <span className="visually-hidden">Previous</span>
                                            </button>
                                            <button
                                                className="carousel-control-next"
                                                type="button"
                                                data-bs-target={"#" + categoriaKey}
                                                data-bs-slide="next"
                                                style={{ width: "15px" }}
                                            >
                                                <i className="bi bi-caret-right-fill" style={{ color: "black" }}></i>
                                                <span className="visually-hidden">Next</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
</>
    );
};

export default AutoEntrevistas;